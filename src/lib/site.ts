import "server-only";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import type { Locale } from "@/i18n/routing";
import { getRedirectRules, getSiteDirectory } from "@/lib/cms/queries";
import { findRedirect, redirectTarget } from "@/lib/redirects";
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

/**
 * For a URL without a page: follow the admin's redirect for this path, if any
 * (Paramètres → Redirections), else render the 404. `path` is locale-less.
 */
export async function redirectOrNotFound(site: SiteKey, locale: Locale, path: string): Promise<never> {
  const rule = findRedirect(path, site, await getRedirectRules());
  if (rule) {
    const target = redirectTarget(rule.to, locale);
    if (rule.permanent) permanentRedirect(target);
    redirect(target);
  }
  notFound();
}
