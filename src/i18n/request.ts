import { getRequestConfig } from "next-intl/server";
import { routing, isValidLocale } from "./routing";

/**
 * Per-request i18n config. Loads the UI-chrome message catalog for the active
 * locale. CMS content is localized separately (via the content layer / Payload).
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && isValidLocale(requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    now: new Date(),
    timeZone: "Africa/Tunis",
  };
});
