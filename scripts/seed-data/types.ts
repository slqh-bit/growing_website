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

export interface ServiceSection {
  /** In-page anchor, e.g. "commercial" → /services/installation-raccordee#commercial. */
  anchor: string;
  icon?: string;
  title: Localized;
  body: Localized;
}

export interface Service {
  slug: string;
  /** Devis activity; none = the quote button leads to /contact (until Phase 5a). */
  activityKey?: ActivityKey;
  /** lucide-react icon name resolved in the UI. */
  icon: string;
  title: Localized;
  shortDescription: Localized;
  body: Localized;
  benefits: Localized<string[]>;
  process: ProcessStep[];
  sections?: ServiceSection[];
  order: number;
  /** Shows the "Company documents" box (tender-oriented pages). */
  showDocuments?: boolean;
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
