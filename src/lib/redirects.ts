/**
 * Admin-managed redirects (Paramètres → Redirections). Dependency-free: used by
 * the Payload collection (path normalization) and the pages (matching).
 */
import type { SiteKey } from "../sites/config";

/** "/services/basse-tension/?x#y" → "/services/basse-tension". */
export function normalizeRedirectPath(path: string): string {
  let p = path.trim().split(/[?#]/)[0] ?? "";
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/{2,}/g, "/");
  return p.length > 1 ? p.replace(/\/+$/, "") : p;
}

export interface RedirectRule {
  from: string;
  to: string;
  permanent: boolean;
  /** Empty = every site. */
  sites: SiteKey[];
}

/** The rule for a locale-less path on a site; a site-specific rule wins over an all-sites one. */
export function findRedirect(path: string, site: SiteKey, rules: readonly RedirectRule[]): RedirectRule | undefined {
  const from = normalizeRedirectPath(path);
  const candidates = rules.filter((r) => normalizeRedirectPath(r.from) === from);
  return candidates.find((r) => r.sites.includes(site)) ?? candidates.find((r) => r.sites.length === 0);
}

/** Target URL in the visitor's language: "/services/x#y" → "/fr/services/x#y"; https URLs unchanged. */
export function redirectTarget(to: string, locale: string): string {
  if (/^https:\/\//.test(to)) return to;
  const [path = "/", hash] = to.split("#", 2);
  const localized = path === "/" ? `/${locale}` : `/${locale}${path}`;
  return hash !== undefined ? `${localized}#${hash}` : localized;
}
