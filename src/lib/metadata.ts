import type { Metadata } from "next";
import { locales, defaultLocale, type Locale } from "@/i18n/routing";
import type { Media } from "@/payload-types";
import { imageSource } from "@/lib/cms/media";
import { getSiteSettings } from "@/lib/cms/queries";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
  locale,
  path,
  title,
  description,
  ogTitle,
  image,
  seo,
  noindex = false,
}: {
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
  const { companyName } = await getSiteSettings(locale);
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
