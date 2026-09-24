import type { Locale } from "../../src/i18n/config";

/**
 * A value localized across the three supported locales.
 * Mirrors Payload's `localized: true` fields (devplan §4): the CMS returns the
 * active-locale value, this content layer stores all three and resolves per call.
 */
export type Localized<T = string> = Record<Locale, T>;

/** Resolve a localized value for the active locale (fr fallback). */
export function t<T>(value: Localized<T>, locale: Locale): T {
  return value[locale] ?? value.fr;
}

/** Activity keys — Payload Services.activityKey enum (devplan §4.1). */
export type ActivityKey = "raccorde" | "pompage" | "isole" | "bt" | "mt";

/** Project client type — Payload Projects.clientType enum (devplan §4.2). */
export type ClientType = "residentiel" | "agricole" | "industriel" | "public";

export interface ProcessStep {
  title: Localized;
  description: Localized;
}

export interface Service {
  slug: string;
  activityKey: ActivityKey;
  /** lucide-react icon name resolved in the UI. */
  icon: string;
  title: Localized;
  shortDescription: Localized;
  body: Localized;
  benefits: Localized<string[]>;
  process: ProcessStep[];
  order: number;
}

export interface Project {
  slug: string;
  activityKey: ActivityKey;
  region: Localized;
  clientType: ClientType;
  powerKwc: number | null;
  title: Localized;
  summary: Localized;
  body: Localized;
  /** ISO date string. */
  date: string;
  featured: boolean;
}

export interface FaqItem {
  question: Localized;
  answer: Localized;
  category: Localized;
  order: number;
}
