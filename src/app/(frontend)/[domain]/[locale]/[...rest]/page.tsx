import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routeContext } from "@/lib/site";
import { RenderBlocks } from "@/blocks/render-blocks";
import { getPageBySlug } from "@/lib/cms/queries";
import { firstHeroSubtitle, RESERVED_PAGE_SLUGS } from "@/lib/cms/pages";
import { buildMetadata } from "@/lib/metadata";

/**
 * Any other URL under a locale. A single segment matching a CMS page slug
 * renders that page (so editors can publish new pages without code, e.g.
 * /fr/partenaires); everything else renders the localized 404.
 * Dedicated routes (/services, /projects, /about…) always take precedence.
 */
type Params = Promise<{ domain: string; locale: Locale; rest: string[] }>;

export function generateStaticParams() {
  return [];
}

async function loadPage(rest: string[], locale: Locale) {
  const [slug] = rest;
  if (rest.length !== 1 || !slug || RESERVED_PAGE_SLUGS.has(slug)) return null;
  return getPageBySlug(slug, locale);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { site, locale, rest } = await routeContext(params);
  const page = await loadPage(rest, locale);
  if (!page) return {};
  return buildMetadata({
    site,
    locale,
    path: `/${page.slug}`,
    title: page.title,
    description: firstHeroSubtitle(page),
    seo: page.seo,
  });
}

export default async function CmsPage({ params }: { params: Params }) {
  const { site, locale, rest } = await routeContext(params);
  setRequestLocale(locale);

  const page = await loadPage(rest, locale);
  if (!page) notFound();

  return <RenderBlocks blocks={page.layout} locale={locale} site={site} />;
}
