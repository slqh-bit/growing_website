import "server-only";
import { unstable_cache } from "next/cache";
import { getPayload, type Where } from "payload";
import config from "@payload-config";
import { cmsTag } from "@/cms/revalidate";
import type { Locale } from "@/i18n/routing";
import type { Faq, Page, Project, Service, Team } from "@/payload-types";

/**
 * Cached CMS reads for the public site (Payload Local API).
 *
 * - Each query is wrapped in `unstable_cache` and tagged with every collection
 *   or global it reads — including populated relations and media — so the
 *   afterChange hooks in src/cms/revalidate.ts refresh exactly what changed.
 *   Pages are then served from the full-route cache until a tag is revalidated.
 * - `overrideAccess: false` applies the collections' public read rules, so the
 *   site can never read what an anonymous visitor isn't allowed to see.
 * - Missing ar/en values fall back to French (Payload localization config).
 */

type CmsSlug =
  | "services"
  | "projects"
  | "faq"
  | "pages"
  | "team"
  | "media"
  | "site-settings"
  | "navigation"
  | "footer";

function cached<A extends unknown[], R>(
  name: string,
  tags: CmsSlug[],
  fn: (...args: A) => Promise<R>,
): (...args: A) => Promise<R> {
  // Arguments (locale, slug…) are part of the cache key automatically.
  return unstable_cache(fn, ["cms", name], { tags: tags.map(cmsTag) });
}

const payload = () => getPayload({ config });
const publicRead = { overrideAccess: false } as const;

// --- Globals -----------------------------------------------------------------

export const getSiteSettings = cached("site-settings", ["site-settings"], async (locale: Locale) =>
  (await payload()).findGlobal({ slug: "site-settings", locale, depth: 0, ...publicRead }),
);

export const getNavigation = cached("navigation", ["navigation"], async (locale: Locale) =>
  (await payload()).findGlobal({ slug: "navigation", locale, depth: 0, ...publicRead }),
);

export const getFooter = cached("footer", ["footer"], async (locale: Locale) =>
  (await payload()).findGlobal({ slug: "footer", locale, depth: 0, ...publicRead }),
);

// --- Services ----------------------------------------------------------------

export const getServices = cached("services", ["services"], async (locale: Locale): Promise<Service[]> => {
  const { docs } = await (await payload()).find({
    collection: "services",
    locale,
    depth: 0,
    sort: "order",
    limit: 50,
    pagination: false,
    ...publicRead,
  });
  return docs;
});

export const getServiceBySlug = cached(
  "service-by-slug",
  ["services", "media", "faq"],
  async (slug: string, locale: Locale): Promise<Service | null> => {
    const { docs } = await (await payload()).find({
      collection: "services",
      where: { slug: { equals: slug } },
      locale,
      depth: 1, // heroImage, faqRefs
      limit: 1,
      ...publicRead,
    });
    return docs[0] ?? null;
  },
);

// --- Projects ----------------------------------------------------------------

const PROJECT_TAGS: CmsSlug[] = ["projects", "services", "media"];

async function findProjects(locale: Locale, where: Where | undefined, limit: number): Promise<Project[]> {
  const { docs } = await (await payload()).find({
    collection: "projects",
    where,
    locale,
    depth: 1, // activity (service), coverImage, gallery
    sort: "-date",
    limit,
    ...publicRead,
  });
  return docs;
}

export const getProjects = cached("projects", PROJECT_TAGS, (locale: Locale) =>
  findProjects(locale, undefined, 200),
);

export const getFeaturedProjects = cached("projects-featured", PROJECT_TAGS, (locale: Locale, limit: number) =>
  findProjects(locale, { featured: { equals: true } }, limit),
);

export const getProjectsByService = cached("projects-by-service", PROJECT_TAGS, (serviceId: number, locale: Locale) =>
  findProjects(locale, { activity: { equals: serviceId } }, 12),
);

export const getProjectBySlug = cached(
  "project-by-slug",
  PROJECT_TAGS,
  async (slug: string, locale: Locale): Promise<Project | null> =>
    (await findProjects(locale, { slug: { equals: slug } }, 1))[0] ?? null,
);

// --- FAQ, Team, Pages --------------------------------------------------------

export const getFaq = cached("faq", ["faq"], async (locale: Locale): Promise<Faq[]> => {
  const { docs } = await (await payload()).find({
    collection: "faq",
    locale,
    depth: 0,
    sort: "order",
    limit: 200,
    pagination: false,
    ...publicRead,
  });
  return docs;
});

export const getTeam = cached("team", ["team", "media"], async (locale: Locale): Promise<Team[]> => {
  const { docs } = await (await payload()).find({
    collection: "team",
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
  async (slug: string, locale: Locale): Promise<Page | null> => {
    const { docs } = await (await payload()).find({
      collection: "pages",
      where: { slug: { equals: slug } },
      locale,
      depth: 1, // block images, logos, FAQ items
      limit: 1,
      ...publicRead,
    });
    return docs[0] ?? null;
  },
);

/** Slugs + last update of all CMS pages (sitemap). Slugs are locale-independent. */
export const getPageSummaries = cached(
  "page-summaries",
  ["pages"],
  async (): Promise<Pick<Page, "slug" | "updatedAt">[]> => {
    const { docs } = await (await payload()).find({
      collection: "pages",
      depth: 0,
      limit: 500,
      pagination: false,
      select: { slug: true, updatedAt: true },
      ...publicRead,
    });
    return docs.map(({ slug, updatedAt }) => ({ slug, updatedAt }));
  },
);
