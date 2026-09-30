import type { Locale } from "../../src/i18n/config";
import { rtlLocales } from "../../src/i18n/config";
import { lexicalFromText } from "../../src/cms/lexical";
import type { Service } from "./types";

/**
 * Seed shapes → Payload data for one locale. Shared by the seed script and the
 * data migrations that bring existing databases to the same content.
 */

export const rich = (text: string, locale: Locale) =>
  lexicalFromText(text, rtlLocales.includes(locale) ? "rtl" : "ltr");

export function serviceData(s: Service, l: Locale, site: number | string) {
  return {
    site,
    title: s.title[l],
    slug: s.slug,
    activityKey: s.activityKey ?? null,
    icon: s.icon,
    order: s.order,
    shortDescription: s.shortDescription[l],
    body: rich(s.body[l], l),
    benefits: s.benefits[l].map((text) => ({ text })),
    process: s.process.map((step) => ({ title: step.title[l], description: step.description[l] })),
    sections: (s.sections ?? []).map((section) => ({
      anchor: section.anchor,
      icon: section.icon ?? null,
      title: section.title[l],
      body: rich(section.body[l], l),
    })),
  };
}
