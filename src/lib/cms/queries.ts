import "server-only";
import { unstable_cache } from "next/cache";
import { getPayload, type Where } from "payload";
import config from "@payload-config";
import { cmsTag } from "@/cms/revalidate";
import type { Locale } from "@/i18n/routing";
import type { RedirectRule } from "@/lib/redirects";
import { isSiteKey, type SiteDomains, type SiteKey } from "@/sites/config";
import type { DevisForm, Faq, Group, Page, Partner, Project, Service, Site, Team } from "@/payload-types";

/**
 * Cached CMS reads for the public site (Payload Local API).
 *
 * - Each query is wrapped in `unstable_cache` and tagged with every collection
 *   it reads — including populated relations and media — so the afterChange
 *   hooks in src/cms/revalidate.ts refresh exactly what changed. Pages are then
 *   served from the full-route cache until a tag is revalidated.
 * - Content belongs to one site (`site` field): every query takes the site key
 *   and only returns that site's documents.
 * - `overrideAccess: false` applies the collections' public read rules, so the
 *   site can never read what an anonymous visitor isn't allowed to see.
 * - Missing ar/en values fall back to French (Payload localization config).
 */

type CmsSlug =
  | "services"
  | "projects"
  | "partners"
  | "faq"
  | "pages"
  | "team"
  | "media"
  | "sites"
  | "redirects"
  | "group"
  | "devis-forms";

function cached<A extends unknown[], R>(
  name: string,
  tags: CmsSlug[],
  fn: (...args: A) => Promise<R>,
): (...args: A) => Promise<R> {
  // Arguments (site, locale, slug…) are part of the cache key automatically.
  return unstable_cache(fn, ["cms", name], { tags: tags.map(cmsTag) });
}

const payload = () => getPayload({ config });
const publicRead = { overrideAccess: false } as const;

/** Documents of one site. */
const ofSite = (site: SiteKey): Where => ({ "site.key": { equals: site } });
const and = (...conditions: (Where | undefined)[]): Where => ({
  and: conditions.filter((c): c is Where => c !== undefined),
});

// --- Sites -------------------------------------------------------------------

/** Key, default flag and domains of every site (hostname → site resolution). */
export const getSiteDirectory = cached("site-directory", ["sites"], async (): Promise<SiteDomains[]> => {
  const { docs } = await (await payload()).find({
    collection: "sites",
    depth: 0,
    sort: "id",
    limit: 50,
    pagination: false,
    select: { key: true, isDefault: true, domains: true },
    ...publicRead,
  });
  return docs.map(({ key, isDefault, domains }) => ({
    key,
    isDefault,
    domains: (domains ?? []).map(({ domain }) => ({ domain })),
  }));
});

/** A site's identity, contacts, figures, brand (logo, favicon populated), menu and footer. */
export const getSite = cached("site", ["sites", "media"], async (key: SiteKey, locale: Locale): Promise<Site> => {
  const { docs } = await (await payload()).find({
    collection: "sites",
    where: { key: { equals: key } },
    locale,
    depth: 1, // logo, logoDark, favicon
    limit: 1,
    ...publicRead,
  });
  if (!docs[0]) throw new Error(`Site "${key}" is missing in the CMS (Paramètres → Sites).`);
  return docs[0];
});

/** Every site of the group, for cross-links (logo populated). */
export const getSites = cached("sites", ["sites", "media"], async (locale: Locale): Promise<Site[]> => {
  const { docs } = await (await payload()).find({
    collection: "sites",
    locale,
    depth: 1, // logo, logoDark
    sort: "id",
    limit: 50,
    pagination: false,
    ...publicRead,
  });
  return docs;
});

/** The group (Paramètres → Groupe): name, page content, members, footer band. */
export const getGroup = cached("group", ["group"], async (locale: Locale): Promise<Group> =>
  (await payload()).findGlobal({ slug: "group", locale, depth: 0, ...publicRead }),
);

// --- Services ----------------------------------------------------------------

export const getServices = cached(
  "services",
  ["services"],
  async (site: SiteKey, locale: Locale): Promise<Service[]> => {
    const { docs } = await (await payload()).find({
      collection: "services",
      where: ofSite(site),
      locale,
      depth: 0,
      sort: "order",
      limit: 100,
      pagination: false,
      ...publicRead,
    });
    return docs;
  },
);

export const getServiceBySlug = cached(
  "service-by-slug",
  ["services", "media", "faq"],
  async (site: SiteKey, slug: string, locale: Locale): Promise<Service | null> => {
    const { docs } = await (await payload()).find({
      collection: "services",
      where: and(ofSite(site), { slug: { equals: slug } }),
      locale,
      depth: 1, // heroImage, section images, faqRefs
      limit: 1,
      ...publicRead,
    });
    return docs[0] ?? null;
  },
);

/** Services by id, any site (cross-selling), with their site populated. */
export const getServicesByIds = cached(
  "services-by-ids",
  ["services", "sites"],
  async (ids: number[], locale: Locale): Promise<Service[]> => {
    if (ids.length === 0) return [];
    const { docs } = await (await payload()).find({
      collection: "services",
      where: { id: { in: ids } },
      locale,
      depth: 1, // site
      limit: ids.length,
      pagination: false,
      ...publicRead,
    });
    // Keep the editor's order.
    return ids.map((id) => docs.find((d) => d.id === id)).filter((d): d is Service => d !== undefined);
  },
);

/**
 * A site's quote forms with every translation (`locale: "all"`: labels are
 * { fr, ar, en } objects at runtime), for the form, the server action and the
 * snapshot kept with each request.
 */
export const getDevisForms = cached("devis-forms", ["devis-forms"], async (site: SiteKey): Promise<DevisForm[]> => {
  const { docs } = await (await payload()).find({
    collection: "devis-forms",
    where: ofSite(site),
    locale: "all",
    depth: 0,
    limit: 200,
    pagination: false,
    ...publicRead,
  });
  return docs;
});

// --- Projects ----------------------------------------------------------------

const PROJECT_TAGS: CmsSlug[] = ["projects", "services", "media"];

async function findProjects(site: SiteKey, locale: Locale, where: Where | undefined, limit: number): Promise<Project[]> {
  const { docs } = await (await payload()).find({
    collection: "projects",
    where: and(ofSite(site), where),
    locale,
    depth: 1, // activity (service), coverImage, gallery
    sort: "-date",
    limit,
    ...publicRead,
  });
  return docs;
}

export const getProjects = cached("projects", PROJECT_TAGS, (site: SiteKey, locale: Locale) =>
  findProjects(site, locale, undefined, 200),
);

export const getFeaturedProjects = cached(
  "projects-featured",
  PROJECT_TAGS,
  (site: SiteKey, locale: Locale, limit: number) => findProjects(site, locale, { featured: { equals: true } }, limit),
);

/** Projects of these services (an area + its sub-services), plus every public-sector one if asked. */
export const getProjectsForService = cached(
  "projects-for-service",
  PROJECT_TAGS,
  (site: SiteKey, serviceIds: number[], withPublicReferences: boolean, locale: Locale) =>
    findProjects(
      site,
      locale,
      withPublicReferences
        ? { or: [{ activity: { in: serviceIds } }, { clientType: { equals: "public" } }] }
        : { activity: { in: serviceIds } },
      withPublicReferences ? 24 : 12,
    ),
);

export const getProjectBySlug = cached(
  "project-by-slug",
  PROJECT_TAGS,
  async (site: SiteKey, slug: string, locale: Locale): Promise<Project | null> =>
    (await findProjects(site, locale, { slug: { equals: slug } }, 1))[0] ?? null,
);

// --- Partners ----------------------------------------------------------------

/** The site's partners/brands: all of them, those for the strip, or those of one service. */
export const getPartners = cached(
  "partners",
  ["partners", "media"],
  async (
    site: SiteKey,
    locale: Locale,
    filter: { strip?: boolean; serviceId?: number } = {},
  ): Promise<Partner[]> => {
    const { docs } = await (await payload()).find({
      collection: "partners",
      where: and(
        { "sites.key": { equals: site } },
        filter.strip ? { showInStrip: { equals: true } } : undefined,
        filter.serviceId !== undefined ? { services: { contains: filter.serviceId } } : undefined,
      ),
      locale,
      depth: 1, // logo
      sort: "order",
      limit: 100,
      pagination: false,
      ...publicRead,
    });
    return docs;
  },
);

// --- FAQ, Team, Pages --------------------------------------------------------

export const getFaq = cached("faq", ["faq"], async (site: SiteKey, locale: Locale): Promise<Faq[]> => {
  const { docs } = await (await payload()).find({
    collection: "faq",
    where: ofSite(site),
    locale,
    depth: 0,
    sort: "order",
    limit: 200,
    pagination: false,
    ...publicRead,
  });
  return docs;
});

export const getTeam = cached("team", ["team", "media"], async (site: SiteKey, locale: Locale): Promise<Team[]> => {
  const { docs } = await (await payload()).find({
    collection: "team",
    where: ofSite(site),
    locale,
    depth: 1, // photo
    sort: "order",
    limit: 100,
    pagination: false,
    ...publicRead,
  });
  return docs;
});

export const getPageBySlug = cached(
  "page-by-slug",
  ["pages", "media", "faq"],
  async (site: SiteKey, slug: string, locale: Locale): Promise<Page | null> => {
    const { docs } = await (await payload()).find({
      collection: "pages",
      where: and(ofSite(site), { slug: { equals: slug } }),
      locale,
      depth: 1, // block images, logos, FAQ items
      limit: 1,
      ...publicRead,
    });
    return docs[0] ?? null;
  },
);

/** Slugs + last update of a site's CMS pages (sitemap). Slugs are locale-independent. */
export const getPageSummaries = cached(
  "page-summaries",
  ["pages"],
  async (site: SiteKey): Promise<Pick<Page, "slug" | "updatedAt">[]> => {
    const { docs } = await (await payload()).find({
      collection: "pages",
      where: ofSite(site),
      depth: 0,
      limit: 500,
      pagination: false,
      select: { slug: true, updatedAt: true },
      ...publicRead,
    });
    return docs.map(({ slug, updatedAt }) => ({ slug, updatedAt }));
  },
);

// --- Redirects ---------------------------------------------------------------

/** Every redirect with the keys of its sites (empty = all sites). */
export const getRedirectRules = cached("redirects", ["redirects", "sites"], async (): Promise<RedirectRule[]> => {
  const { docs } = await (await payload()).find({
    collection: "redirects",
    depth: 1, // sites → key
    limit: 1000,
    pagination: false,
    ...publicRead,
  });
  return docs.map((r) => ({
    from: r.from,
    to: r.to,
    permanent: r.permanent !== false,
    sites: (r.sites ?? [])
      .map((s) => (typeof s === "object" ? s.key : null))
      .filter((key): key is SiteKey => key !== null && isSiteKey(key)),
  }));
});
