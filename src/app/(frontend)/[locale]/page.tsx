import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { RenderBlocks } from "@/blocks/render-blocks";
import { getPageBySlug, getSiteSettings } from "@/lib/cms/queries";
import { buildMetadata } from "@/lib/metadata";
import { firstHeroSubtitle } from "@/lib/cms/pages";

/** Home page = the CMS page with slug "home", built from blocks. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [page, settings, tc] = await Promise.all([
    getPageBySlug("home", locale),
    getSiteSettings(locale),
    getTranslations({ locale, namespace: "common" }),
  ]);
  // No `title`: the layout's default "<company> — <tagline>" applies unless
  // the page's SEO meta title overrides it.
  return buildMetadata({
    locale,
    path: "",
    description: firstHeroSubtitle(page) ?? tc("companyTagline"),
    ogTitle: page?.seo?.metaTitle || `${settings.companyName} — ${tc("companyTagline")}`,
    seo: page?.seo,
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const page = await getPageBySlug("home", locale);
  if (!page) notFound();

  return <RenderBlocks blocks={page.layout} locale={locale} />;
}
