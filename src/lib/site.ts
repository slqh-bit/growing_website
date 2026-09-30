import "server-only";
import type { Locale } from "@/i18n/routing";
import { getSiteDirectory } from "@/lib/cms/queries";
import { matchSite, normalizeHost, type SiteKey } from "@/sites/config";

/**
 * The site a request belongs to. The middleware rewrites every public URL to
 * /[domain]/[locale]/…, so pages stay statically cached per domain and resolve
 * their site here from the (cached) domains configured in the admin.
 */
export async function resolveSiteKey(domain: string): Promise<SiteKey> {
  const key = matchSite(normalizeHost(decodeURIComponent(domain)), await getSiteDirectory());
  if (!key) {
    throw new Error("No site configured: create one in the admin (Paramètres → Sites) or run `npm run seed`.");
  }
  return key;
}

/** Route params `{ domain, locale, …rest }` → `{ site, locale, …rest }`. */
export async function routeContext<P extends { domain: string; locale: Locale }>(
  params: Promise<P>,
): Promise<Omit<P, "domain"> & { site: SiteKey }> {
  const { domain, ...rest } = await params;
  return { ...rest, site: await resolveSiteKey(domain) };
}
