/**
 * Which page sections a site's editors may add. The group site's own sections
 * (group hero, companies, quote form…) are only offered on the group site, but
 * one a company page already uses stays allowed: Payload refuses to save a
 * page holding a section its filter no longer allows.
 */
export function allowedBlockSlugs({
  all,
  groupOnly,
  siteKey,
  used,
}: {
  all: readonly string[];
  groupOnly: readonly string[];
  /** null while the page's site isn't known yet. */
  siteKey: string | null;
  used: readonly string[];
}): string[] {
  if (siteKey === null || siteKey === "group") return [...all];
  return all.filter((slug) => !groupOnly.includes(slug) || used.includes(slug));
}
