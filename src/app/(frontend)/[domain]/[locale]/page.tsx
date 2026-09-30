import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routeContext } from "@/lib/site";
import { RenderBlocks } from "@/blocks/render-blocks";
import { getPageBySlug, getSite } from "@/lib/cms/queries";
import { buildMetadata } from "@/lib/metadata";
import { firstHeroSubtitle } from "@/lib/cms/pages";

/** Home page = the CMS page with slug "home", built from blocks. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; locale: Locale }>;
}): Promise<Metadata> {
  const { site, locale } = await routeContext(params);
  const [page, settings] = await Promise.all([getPageBySlug(site, "home", locale), getSite(site, locale)]);
  // No `title`: the layout's default "<company> — <tagline>" applies unless
  // the page's SEO meta title overrides it.
  return buildMetadata({
    site,
    locale,
    path: "",
    description: firstHeroSubtitle(page) ?? settings.tagline,
    ogTitle: page?.seo?.metaTitle || `${settings.companyName} — ${settings.tagline}`,
    seo: page?.seo,
  });
}

export default async function HomePage({ params }: { params: Promise<{ domain: string; locale: Locale }> }) {
  const { site, locale } = await routeContext(params);
  setRequestLocale(locale);

  const page = await getPageBySlug(site, "home", locale);
  if (!page) notFound();

  return <RenderBlocks blocks={page.layout} locale={locale} site={site} />;
}
