import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale, rtlLocales, type Locale } from "./config";

export { locales, defaultLocale, rtlLocales, localeNames, type Locale } from "./config";

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
