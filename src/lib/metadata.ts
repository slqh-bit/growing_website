import type { Metadata } from "next";
import { locales, defaultLocale, type Locale } from "@/i18n/routing";
import { siteSettings } from "@/content/site";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const ogLocale: Record<Locale, string> = {
  fr: "fr_TN",
  ar: "ar_TN",
  en: "en_US",
};

/**
 * Per-page metadata with a self-referencing canonical, hreflang alternates for
 * every locale (+ x-default) and matching OpenGraph tags.
 *
 * Next.js replaces (not merges) `alternates` and `openGraph` from parent
 * layouts, so every indexable page must call this with its own `path`.
 *
 * @param path Locale-agnostic route, e.g. "" (home) or "/services/site-isole".
 */
export function buildMetadata({
  locale,
  path,
  title,
  description,
  ogTitle,
  noindex = false,
}: {
  locale: Locale;
  path: string;
  title?: string;
  description?: string;
  ogTitle?: string;
  noindex?: boolean;
}): Metadata {
  const route = path === "/" ? "" : path;
  const languages: Record<string, string> = Object.fromEntries(
    locales.map((l) => [l, `/${l}${route}`]),
  );
  languages["x-default"] = `/${defaultLocale}${route}`;

  return {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    alternates: {
      canonical: `/${locale}${route}`,
      languages,
    },
    openGraph: {
      type: "website",
      siteName: siteSettings.companyName,
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      url: `/${locale}${route}`,
      title: ogTitle ?? (title ? `${title} — ${siteSettings.companyName}` : siteSettings.companyName),
      ...(description !== undefined && { description }),
    },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}
