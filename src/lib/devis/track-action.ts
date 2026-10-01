"use server";

import { timingSafeEqual } from "crypto";
import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { currentSiteKey } from "@/lib/site";
import { isValidTnPhone, normalizeTnPhone } from "./phone";
import { clientIp, takeToken } from "./rate-limit";
import { buildTrackingView, normalizeReference, type TrackingInput, type TrackingView } from "./tracking";

/**
 * Tracking lookup for /{locale}/suivi. Needs the reference AND the phone given
 * in the request: references are short, so the phone keeps them from being
 * enumerated. A wrong reference and a wrong phone get the same answer, and only
 * the progress (status + dates) is returned — never contact or technical data.
 */

export type TrackDevisResult =
  | { ok: true; view: TrackingView }
  | {
      ok: false;
      error: "invalidReference" | "invalidPhone" | "notFound" | "rateLimited" | "server";
    };

/** Per client IP, see RATE_LIMIT in ./actions. */
const RATE_LIMIT = { perIp: 10, unknownIp: 60, windowMs: 15 * 60_000 };

export async function trackDevis(input: {
  reference: string;
  phone: string;
}): Promise<TrackDevisResult> {
  const reference = normalizeReference(String(input.reference ?? ""));
  if (!reference) return { ok: false, error: "invalidReference" };
  const phone = String(input.phone ?? "");
  if (!isValidTnPhone(phone)) return { ok: false, error: "invalidPhone" };

  const payload = await getPayload({ config });
  const ip = clientIp(await headers());
  if (
    !takeToken(
      `track:${ip}`,
      ip === "unknown" ? RATE_LIMIT.unknownIp : RATE_LIMIT.perIp,
      RATE_LIMIT.windowMs,
    )
  ) {
    payload.logger.warn(`Devis tracking rate limit hit for ${ip}.`);
    return { ok: false, error: "rateLimited" };
  }

  try {
    // Only this site's requests (its own reference prefix and team); the group
    // site takes requests for every company, so it tracks them all.
    const site = await currentSiteKey();
    const { docs } = await payload.find({
      collection: "devis-requests",
      where: {
        and: [{ reference: { equals: reference } }, ...(site === "group" ? [] : [{ "site.key": { equals: site } }])],
      },
      limit: 1,
      depth: 0,
      pagination: false,
      overrideAccess: true, // leads are staff-only; the phone check below is the access rule
      select: {
        reference: true,
        phone: true,
        activity: true,
        status: true,
        createdAt: true,
        statusHistory: true,
        formSnapshot: true,
      },
    });
    const lead = docs[0];
    if (!lead || !samePhone(lead.phone, normalizeTnPhone(phone)))
      return { ok: false, error: "notFound" };
    const snapshot = lead.formSnapshot as { serviceTitle?: TrackingInput["service"] } | null | undefined;
    return { ok: true, view: buildTrackingView({ ...lead, service: snapshot?.serviceTitle ?? null }) };
  } catch (error) {
    payload.logger.error({ err: error, msg: "Devis tracking lookup failed" });
    return { ok: false, error: "server" };
  }
}

function samePhone(stored: string | null | undefined, given: string): boolean {
  const a = Buffer.from(stored ?? "");
  const b = Buffer.from(given);
  return a.length === b.length && timingSafeEqual(a, b);
}
