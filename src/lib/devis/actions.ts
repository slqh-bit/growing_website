"use server";

import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { getPayload, type RequiredDataFromCollectionSlug } from "payload";
import config from "@payload-config";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { notifyNewLead } from "./notify";
import { clientIp, takeToken } from "./rate-limit";
import { devisSchema, fieldErrorsOf, type DevisData, type DevisErrorKey } from "./schema";

/**
 * Devis submission (devplan §6). Server actions are POST-only and Next.js
 * rejects cross-origin calls (Origin/Host check), so this is CSRF-safe.
 *
 * 1. Silent anti-spam: honeypot field + minimum fill time → fake success.
 * 2. Per-IP rate limit.
 * 3. Authoritative validation with the shared Zod schema.
 * 4. Persist to DevisRequests (status "nouveau", reference generated).
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

export async function submitDevis(raw: unknown, meta: SubmitDevisMeta): Promise<SubmitDevisResult> {
  const locale: Locale = (locales as readonly string[]).includes(meta.locale) ? (meta.locale as Locale) : defaultLocale;
  const payload = await getPayload({ config });

  const tooFast = typeof meta.startedAt !== "number" || Date.now() - meta.startedAt < MIN_FILL_MS;
  if (meta.website || tooFast) {
    payload.logger.info(`Devis spam trap triggered (${meta.website ? "honeypot" : "too fast"}); not stored.`);
    return { ok: true, reference: fakeReference() };
  }

  const ip = clientIp(await headers());
  const limit = ip === "unknown" ? RATE_LIMIT.unknownIp : RATE_LIMIT.perIp;
  if (!takeToken(`devis:${ip}`, limit, RATE_LIMIT.windowMs)) {
    payload.logger.warn(`Devis rate limit hit for ${ip}.`);
    return { ok: false, error: "rateLimited" };
  }

  const parsed = devisSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "validation", fieldErrors: fieldErrorsOf(parsed.error) };
  }

  try {
    const lead = await payload.create({
      collection: "devis-requests",
      data: toLeadData(parsed.data, locale),
      overrideAccess: true, // public visitors can't create leads through the REST API
    });
    after(() => notifyNewLead(payload, lead));
    return { ok: true, reference: lead.reference ?? String(lead.id) };
  } catch (error) {
    payload.logger.error({ err: error, msg: "Devis submission could not be stored" });
    return { ok: false, error: "server" };
  }
}

/** Typed against the generated collection type: schema/collection drift is a compile error. */
function toLeadData(data: DevisData, locale: Locale): RequiredDataFromCollectionSlug<"devis-requests"> {
  return {
    activity: data.activity,
    raccorde: data.raccorde,
    pompage: data.pompage,
    isole: data.isole,
    electrical: data.electrical,
    fullName: data.fullName,
    phone: data.phone,
    email: data.email,
    region: data.region,
    address: data.address,
    preferredChannel: data.preferredChannel,
    consent: data.consent,
    status: "nouveau",
    locale,
  };
}

function fakeReference(): string {
  const ymd = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `GT-${ymd}-${randomBytes(2).toString("hex").toUpperCase()}`;
}
