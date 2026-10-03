import "server-only";
import { headers } from "next/headers";
import type { Locale } from "@/i18n/routing";
import type { Group, Site } from "@/payload-types";
import { getGroup, getSites } from "@/lib/cms/queries";
import { otherSiteOrigin } from "@/lib/metadata";
import { isLocalhost, normalizeHost } from "@/sites/config";

/** URL, on another site of the group, of a path starting with the locale ("/fr/services"). */
export type SiteLink = (path: string) => string;

/**
 * How to link to another site of the group (null: it has no address yet).
 *
 * On an address the sites share (onSharedDevAddress), the link stays on it and
 * switches site with `?site=<key>` (middleware).
 */
export async function siteLink(site: Pick<Site, "url" | "domains" | "key">): Promise<SiteLink | null> {
  if (!site.url && !site.domains?.length && (await onSharedDevAddress())) {
    return (path) => `${path}?site=${site.key}`;
  }
  const origin = otherSiteOrigin(site);
  return origin ? (path) => `${origin}${path}` : null;
}

/**
 * Development from another device (the machine's IP address or name): the
 * sites share that one address, since `<key>.localhost` doesn't exist there.
 * Always false in production.
 */
export async function onSharedDevAddress(): Promise<boolean> {
  if (process.env.NODE_ENV === "production") return false;
  return !isLocalhost(normalizeHost((await headers()).get("host")));
}

export interface GroupMember {
  site: Site;
  /** Short presentation from Paramètres → Groupe (else the site's tagline). */
  summary: string;
  /** Links to this company's site (null: no public address yet). */
  link: SiteLink | null;
}

/**
 * The group and its companies, in the order set in Paramètres → Groupe;
 * without any configured, every company site (not the group's own site).
 */
export async function getGroupMembers(locale: Locale): Promise<{ group: Group; members: GroupMember[] }> {
  const [group, sites] = await Promise.all([getGroup(locale), getSites(locale)]);
  const configured = (group.members ?? []).flatMap((m) => {
    const id = typeof m.site === "object" ? m.site.id : m.site;
    const site = sites.find((s) => s.id === id);
    return site ? [{ site, summary: m.summary }] : [];
  });
  const list = configured.length > 0 ? configured : sites.filter((s) => s.key !== "group").map((site) => ({ site, summary: null }));
  return {
    group,
    members: await Promise.all(
      list.map(async ({ site, summary }) => ({
        site,
        summary: summary || site.tagline,
        link: await siteLink(site),
      })),
    ),
  };
}
