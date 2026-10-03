/**
 * The group's websites (plan §1). One Payload `sites` document per key holds
 * everything that differs between them (identity, contacts, theme, logo).
 *
 * Dependency-free: imported by the middleware (edge), the Payload config / CLI
 * and the app.
 */
export const siteKeys = ["growing", "hikview", "group"] as const;
export type SiteKey = (typeof siteKeys)[number];

/** Development only: `?site=<key>` previews a site on plain localhost; remembered in this cookie. */
export const SITE_PREVIEW_COOKIE = "site-preview";

export function isSiteKey(value: string): value is SiteKey {
  return (siteKeys as readonly string[]).includes(value);
}

/** What a malformed Host header becomes: resolved to the default site. */
export const UNKNOWN_HOST = "unknown.invalid";

/**
 * Hostname sent by the middleware as the `[domain]` route segment: lowercase,
 * no port, no trailing dot. Anything that isn't a plain hostname becomes
 * UNKNOWN_HOST (resolved to the default site).
 */
export function normalizeHost(host: string | null | undefined): string {
  const hostname = (host ?? "")
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "")
    .replace(/\.$/, "");
  return /^[a-z0-9-]+(\.[a-z0-9-]+)*$/.test(hostname) ? hostname : UNKNOWN_HOST;
}

export interface SiteDomains {
  key: SiteKey;
  isDefault?: boolean | null;
  domains?: { domain: string }[] | null;
}

/**
 * Which site a hostname belongs to:
 *   1. a domain listed on a site in the admin (www. is matched too);
 *   2. development: `<key>.localhost` (growing.localhost, hikview.localhost);
 *      an address without a name — plain `localhost` or an IP address (the
 *      machine's network address, e.g. 192.168.1.20) — is the group site when
 *      it exists;
 *   3. the site marked "default", else the first one (unknown domains).
 * Returns null only when no site exists at all.
 */
export function matchSite(hostname: string, sites: readonly SiteDomains[]): SiteKey | null {
  const bare = hostname.replace(/^www\./, "");
  const listed = sites.find((site) =>
    (site.domains ?? []).some(({ domain }) => {
      const d = normalizeHost(domain).replace(/^www\./, "");
      return d === bare;
    }),
  );
  if (listed) return listed.key;

  const nameless = hostname === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
  const local = nameless ? "group" : /^([a-z0-9-]+)\.localhost$/.exec(hostname)?.[1];
  const byKey = local ? sites.find((site) => site.key === local) : undefined;
  if (byKey) return byKey.key;

  return (sites.find((site) => site.isDefault) ?? sites[0])?.key ?? null;
}
