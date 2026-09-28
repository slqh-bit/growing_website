import type { MetadataRoute } from "next";
import { defaultLocale, locales } from "@/i18n/config";
import { getPageSummaries, getProjects, getServices, getTeam } from "@/lib/cms/queries";
import { RESERVED_PAGE_SLUGS } from "@/lib/cms/pages";
import { siteUrl } from "@/lib/metadata";

/**
 * sitemap.xml — every indexable URL in the three locales, each entry listing
 * its hreflang alternates (+ x-default). Built on request from the cached CMS
 * queries (no database access at build time); refreshed when content changes.
 */
export const dynamic = "force-dynamic";

/** Dedicated routes. A CMS page with one of these slugs is shadowed by the route. */
const STATIC_ROUTES: { path: string; changeFrequency: "weekly" | "monthly" | "yearly"; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/services", changeFrequency: "monthly", priority: 0.9 },
  { path: "/devis", changeFrequency: "yearly", priority: 0.9 },
  { path: "/projects", changeFrequency: "weekly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/mentions-legales", changeFrequency: "yearly", priority: 0.2 },
  { path: "/politique-confidentialite", changeFrequency: "yearly", priority: 0.2 },
];
const SHADOWED_SLUGS = new Set([
  ...RESERVED_PAGE_SLUGS,
  ...STATIC_ROUTES.map((r) => r.path.slice(1)),
  "team",
  "blog",
  "suivi", // client tracking page: noindex, not in the sitemap
]);

type Entry = MetadataRoute.Sitemap[number];

function entries(
  path: string,
  extra: Omit<Entry, "url" | "alternates"> = {},
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((l) => [l, `${siteUrl}/${l}${path}`]),
  );
  languages["x-default"] = `${siteUrl}/${defaultLocale}${path}`;
  return locales.map((l) => ({ url: `${siteUrl}/${l}${path}`, alternates: { languages }, ...extra }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, pages, team] = await Promise.all([
    getServices(defaultLocale),
    getProjects(defaultLocale),
    getPageSummaries(),
    getTeam(defaultLocale),
  ]);

  return [
    ...STATIC_ROUTES.flatMap(({ path, changeFrequency, priority }) => entries(path, { changeFrequency, priority })),
    // /team stays "Coming soon" (noindex) until the first member is added.
    ...(team.length > 0 ? entries("/team", { changeFrequency: "monthly", priority: 0.4 }) : []),
    ...services.flatMap((s) =>
      entries(`/services/${s.slug}`, { lastModified: s.updatedAt, changeFrequency: "monthly", priority: 0.8 }),
    ),
    ...projects.flatMap((p) =>
      entries(`/projects/${p.slug}`, { lastModified: p.updatedAt, changeFrequency: "yearly", priority: 0.6 }),
    ),
    ...pages
      .filter((p) => !SHADOWED_SLUGS.has(p.slug))
      .flatMap((p) => entries(`/${p.slug}`, { lastModified: p.updatedAt, changeFrequency: "monthly", priority: 0.5 })),
  ];
}
