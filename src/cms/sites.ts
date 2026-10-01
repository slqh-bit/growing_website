import type { Payload } from "payload";
import type { Locale } from "../i18n/config";
import type { Site } from "../payload-types";
import type { SiteKey } from "../sites/config";

/**
 * A site document outside the public page cache (emails, hooks, scripts).
 * Without `key`: the default site (Sites → "Site par défaut"), else the first one.
 */
export async function findSite(payload: Payload, locale: Locale, key?: SiteKey): Promise<Site> {
  const find = (where?: { key?: { equals: SiteKey }; isDefault?: { equals: true } }) =>
    payload.find({ collection: "sites", where, locale, depth: 0, sort: "id", limit: 1 }).then((r) => r.docs[0]);

  const site = key ? await find({ key: { equals: key } }) : ((await find({ isDefault: { equals: true } })) ?? (await find()));
  if (!site) throw new Error(`No site "${key ?? "default"}" in the CMS (Paramètres → Sites).`);
  return site;
}

/** The site a quote request belongs to (older requests without one: the default site). */
export async function findLeadSite(
  payload: Payload,
  locale: Locale,
  lead: { site?: number | Site | null },
): Promise<Site> {
  if (lead.site && typeof lead.site === "object") return lead.site;
  if (typeof lead.site === "number") {
    const site = await payload.findByID({ collection: "sites", id: lead.site, locale, depth: 0 }).catch(() => null);
    if (site) return site;
  }
  return findSite(payload, locale);
}
