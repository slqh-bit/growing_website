"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import type { DevisRequest } from "@/payload-types";
import { getSite } from "@/lib/cms/queries";
import { currentSiteKey } from "@/lib/site";
import { attachmentMimeType, checkAttachments, matchesSignature } from "./attachments";
import { getDevisChoices } from "./choices";
import { attachmentsMode, type FormSnapshot } from "./form-def";
import { notifyNewLead } from "./notify";
import { clientIp, takeToken } from "./rate-limit";
import { devisSchema, fieldErrorsOf, type DevisErrorKey } from "./schema";
import { generateReference, referencePrefix } from "./reference";

/**
 * Devis submission (plan §6). Server actions are POST-only and Next.js rejects
 * cross-origin calls (Origin/Host check), so this is CSRF-safe.
 *
 * 1. Silent anti-spam: honeypot field + minimum fill time → fake success.
 * 2. Per-IP rate limit.
 * 3. Authoritative validation: the site comes from the request's host and the
 *    service's form definition is re-read on the server, never taken from the
 *    browser.
 * 4. Persist to DevisRequests (status "nouveau", reference with the site's
 *    initials) with the answers, a snapshot of the form and the attached
 *    files (DevisAttachments; Payload checks each file's real content type).
 * 5. Notifications after the response (`after`), so the visitor never waits
 *    on SMTP/Telegram and a mail outage never loses a lead.
 */

export type SubmitDevisResult =
  | { ok: true; reference: string }
  | { ok: false; error: "validation"; fieldErrors: Record<string, DevisErrorKey> }
  | { ok: false; error: "rateLimited" | "server" };

export interface SubmitDevisMeta {
  locale: string;
  /** Honeypot: hidden from humans, bots fill it. */
  website?: string;
  /** Date.now() when the form was first shown. */
  startedAt?: number;
}

/** A human needs more than this to go through four steps. */
const MIN_FILL_MS = 5_000;
/** Per client IP. Without a proxy header every visitor shares the "unknown"
 *  bucket, so it gets a much higher ceiling instead of blocking real clients. */
const RATE_LIMIT = { perIp: 5, unknownIp: 30, windowMs: 15 * 60_000 };

/**
 * @param files FormData whose `files` entries are the attachments (plans,
 *   photos, specifications), when the service's form accepts them.
 */
export async function submitDevis(raw: unknown, meta: SubmitDevisMeta, files?: FormData): Promise<SubmitDevisResult> {
  const locale: Locale = (locales as readonly string[]).includes(meta.locale) ? (meta.locale as Locale) : defaultLocale;
  const payload = await getPayload({ config });
  const site = await currentSiteKey();
  const siteDoc = await getSite(site, locale);

  const tooFast = typeof meta.startedAt !== "number" || Date.now() - meta.startedAt < MIN_FILL_MS;
  if (meta.website || tooFast) {
    // warn, not info: a real visitor caught here loses their lead, so it must stand out.
    payload.logger.warn(`Devis spam trap triggered (${meta.website ? "honeypot" : "too fast"}); not stored.`);
    return { ok: true, reference: generateReference(referencePrefix(siteDoc.monogram)) };
  }

  const ip = clientIp(await headers());
  const limit = ip === "unknown" ? RATE_LIMIT.unknownIp : RATE_LIMIT.perIp;
  if (!takeToken(`devis:${ip}`, limit, RATE_LIMIT.windowMs)) {
    payload.logger.warn(`Devis rate limit hit for ${ip}.`);
    return { ok: false, error: "rateLimited" };
  }

  const choices = await getDevisChoices(site, locale);
  const serviceId = String((raw as { service?: unknown } | null)?.service ?? "");
  const choice = choices.find((c) => c.id === serviceId);
  const parsed = devisSchema(
    choices.map((c) => c.id),
    choice?.form ?? { questions: [] },
  ).safeParse(raw);
  if (!parsed.success) return { ok: false, error: "validation", fieldErrors: fieldErrorsOf(parsed.error) };
  if (!choice) return { ok: false, error: "validation", fieldErrors: { service: "chooseActivity" } };

  const mode = attachmentsMode(choice.form);
  const uploads = mode === "off" ? [] : (files?.getAll("files") ?? []).filter((f): f is File => f instanceof File);
  const fileError = mode === "required" && uploads.length === 0 ? "required" : checkAttachments(uploads);
  if (fileError) return { ok: false, error: "validation", fieldErrors: { attachments: fileError } };

  const attachmentIds: number[] = [];
  const discardAttachments = () =>
    Promise.allSettled(
      attachmentIds.map((id) => payload.delete({ collection: "devis-attachments", id, overrideAccess: true })),
    );

  const contents = await Promise.all(uploads.map(async (f) => Buffer.from(await f.arrayBuffer())));
  if (uploads.some((f, i) => !matchesSignature(f.name, contents[i]!))) {
    return { ok: false, error: "validation", fieldErrors: { attachments: "fileType" } };
  }

  for (const [i, file] of uploads.entries()) {
    try {
      const doc = await payload.create({
        collection: "devis-attachments",
        data: { site: siteDoc.id },
        file: {
          data: contents[i]!,
          mimetype: attachmentMimeType(file.name),
          name: file.name,
          size: file.size,
        },
        overrideAccess: true,
      });
      attachmentIds.push(doc.id);
    } catch (error) {
      // Mostly content that doesn't match its extension (Payload sniffs the bytes).
      payload.logger.warn({ err: error, msg: `Devis attachment "${file.name}" refused` });
      await discardAttachments();
      return { ok: false, error: "validation", fieldErrors: { attachments: "fileType" } };
    }
  }

  try {
    // Every translation of the service's title, for the snapshot.
    const service = await payload.findByID({ collection: "services", id: Number(choice.id), locale: "all", depth: 0 });
    const snapshot: FormSnapshot = { serviceTitle: service.title as FormSnapshot["serviceTitle"], ...choice.form };
    const data = parsed.data;
    const lead = await payload.create({
      collection: "devis-requests",
      data: {
        site: siteDoc.id,
        service: service.id,
        activity: (choice.activityKey as DevisRequest["activity"]) ?? undefined,
        technicalDetails: data.answers,
        formSnapshot: snapshot as unknown as DevisRequest["formSnapshot"],
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        region: data.region,
        address: data.address,
        preferredChannel: data.preferredChannel,
        siteVisit: data.siteVisit,
        attachments: attachmentIds,
        consent: data.consent,
        status: "nouveau",
        locale,
      },
      overrideAccess: true, // public visitors can't create leads through the REST API
    });
    after(() => notifyNewLead(payload, lead));
    return { ok: true, reference: lead.reference ?? String(lead.id) };
  } catch (error) {
    payload.logger.error({ err: error, msg: "Devis submission could not be stored" });
    await discardAttachments();
    return { ok: false, error: "server" };
  }
}
