import "server-only";
import type { Locale } from "@/i18n/routing";
import type { Group, Site } from "@/payload-types";
import { getGroup, getSites } from "@/lib/cms/queries";
import { otherSiteOrigin } from "@/lib/metadata";

export interface GroupMember {
  site: Site;
  /** Short presentation from Paramètres → Groupe (else the site's tagline). */
  summary: string;
  /** Where to link to this company's site (null: no public address yet). */
  origin: string | null;
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
    members: list.map(({ site, summary }) => ({
      site,
      summary: summary || site.tagline,
      origin: otherSiteOrigin(site),
    })),
  };
}
