/**
 * Single source of truth for supported locales, shared by the Next.js routing
 * (next-intl) and the Payload CMS localization config. Dependency-free so it
 * can be imported from the Payload CLI (seed, migrations) as well as the app.
 */
export const locales = ["fr", "ar", "en"] as const;
export type Locale = (typeof locales)[number];

/** Default landing locale and CMS default/fallback locale (devplan §5). */
export const defaultLocale: Locale = "fr";

/** Locales that render right-to-left. */
export const rtlLocales: readonly Locale[] = ["ar"];

/** Native display names (language switcher, CMS locale picker). */
export const localeNames: Record<Locale, string> = {
  fr: "Français",
  ar: "العربية",
  en: "English",
};
