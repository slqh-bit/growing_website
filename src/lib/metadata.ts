import type { Metadata } from "next";
import { locales, defaultLocale, type Locale } from "@/i18n/routing";
import type { Media, Site } from "@/payload-types";
import type { SiteKey } from "@/sites/config";
import { imageSource } from "@/lib/cms/media";
import { getSite } from "@/lib/cms/queries";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Public origin of a site (Sites → Adresse publique), else NEXT_PUBLIC_SITE_URL. */
export function siteOrigin(site: Pick<Site, "url">): string {
  return site.url || siteUrl;
}

const ogLocale: Record<Locale, string> = {
  fr: "fr_TN",
  ar: "ar_TN",
  en: "en_US",
};

/** The `seo` group shared by Pages, Services and Projects in the CMS. */
export interface SeoFields {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: number | Media | null;
}

/**
 * Per-page metadata with a self-referencing canonical, hreflang alternates for
 * every locale (+ x-default) and matching OpenGraph tags. CMS `seo` overrides
 * (meta title/description, share image) win over the page defaults.
 *
 * Next.js replaces (not merges) `alternates` and `openGraph` from parent
 * layouts, so every indexable page must call this with its own `path`.
 *
 * @param path Locale-agnostic route, e.g. "" (home) or "/services/site-isole".
 */
export async function buildMetadata({
  site,
  locale,
  path,
  title,
  description,
  ogTitle,
  image,
  seo,
  noindex = false,
}: {
  site: SiteKey;
  locale: Locale;
  path: string;
  title?: string;
  description?: string;
  ogTitle?: string;
  /** Default share image (e.g. a project's cover) when `seo.ogImage` is empty. */
  image?: number | Media | null;
  seo?: SeoFields | null;
  noindex?: boolean;
}): Promise<Metadata> {
  const { companyName } = await getSite(site, locale);
  const route = path === "/" ? "" : path;
  const finalTitle = seo?.metaTitle || title;
  const finalDescription = seo?.metaDescription || description;
  const share = imageSource(seo?.ogImage ?? image, "hero");

  const languages: Record<string, string> = Object.fromEntries(
    locales.map((l) => [l, `/${l}${route}`]),
  );
  languages["x-default"] = `/${defaultLocale}${route}`;

  return {
    ...(finalTitle !== undefined && { title: finalTitle }),
    ...(finalDescription !== undefined && { description: finalDescription }),
    alternates: {
      canonical: `/${locale}${route}`,
      languages,
    },
    openGraph: {
      type: "website",
      siteName: companyName,
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      url: `/${locale}${route}`,
      title: ogTitle ?? (finalTitle ? `${finalTitle} — ${companyName}` : companyName),
      ...(finalDescription !== undefined && { description: finalDescription }),
      ...(share && { images: [{ url: share.src, width: share.width, height: share.height, alt: share.alt }] }),
    },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}
