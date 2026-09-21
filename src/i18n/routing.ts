import { defineRouting } from "next-intl/routing";

/**
 * Supported locales. `fr` is the default landing locale (see devplan §5).
 * `ar` is right-to-left; everything else is left-to-right.
 */
export const locales = ["fr", "ar", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

/** Locales that render right-to-left. */
export const rtlLocales: Locale[] = ["ar"];

export function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}

export function isRtl(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}

export function getDir(locale: string): "rtl" | "ltr" {
  return isRtl(locale) ? "rtl" : "ltr";
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Always prefix so /fr, /ar, /en are explicit and hreflang stays clean.
  localePrefix: "always",
});
