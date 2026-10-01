import type { CollectionSlug, Payload, PayloadRequest } from "payload";
import { defaultLocale, locales, type Locale } from "../i18n/config";

/**
 * Writing one document in every locale through the Local API (seed script and
 * data migrations). `build(locale)` returns that locale's data.
 */

const otherLocales = locales.filter((l) => l !== defaultLocale);

/**
 * Keys whose arrays are `localized: true` (each locale owns its rows) or that
 * hold rich text. Their row ids must NOT be copied across locales.
 */
const SKIP_ID_KEYS = new Set(["benefits", "body", "content"]);

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Non-localized arrays/blocks share their rows across locales; only the
 * localized sub-fields differ. When writing ar/en we must therefore re-use the
 * row ids created for fr, otherwise Payload would treat them as new rows and
 * drop the French values.
 */
export function withRowIds<T>(data: T, existing: unknown): T {
  if (Array.isArray(data) && Array.isArray(existing)) {
    return data.map((row, i) => {
      const prev = existing[i];
      if (!isObject(row) || !isObject(prev)) return row;
      const merged = withRowIds(row, prev) as Record<string, unknown>;
      return prev.id !== undefined ? { ...merged, id: prev.id } : merged;
    }) as T;
  }
  if (isObject(data) && isObject(existing)) {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, SKIP_ID_KEYS.has(k) ? v : withRowIds(v, existing[k])]),
    ) as T;
  }
  return data;
}

/* The Local API's per-collection generics don't narrow inside a generic helper,
   so these helpers take plain objects. Payload still validates every field at
   runtime (required, select options, custom validators) and throws on bad data. */
type AnyData = Record<string, unknown>;
type LooseApi = {
  create(args: object): Promise<{ id: number | string } & AnyData>;
  update(args: object): Promise<{ id: number | string } & AnyData>;
};

export interface WriteOptions {
  /** Inside a migration: run in its transaction. */
  req?: PayloadRequest;
}

/** Scripts and migrations skip page-cache revalidation (no Next.js request). */
const context = { disableRevalidate: true };

/** Create a document, then fill its other locales. Returns the id. */
export async function createLocalized(
  payload: Payload,
  collection: CollectionSlug,
  build: (locale: Locale) => AnyData,
  { req }: WriteOptions = {},
): Promise<number | string> {
  const api = payload as unknown as LooseApi;
  let doc = await api.create({ collection, data: build(defaultLocale), locale: defaultLocale, depth: 0, context, req });
  for (const locale of otherLocales) {
    doc = await api.update({ collection, id: doc.id, data: withRowIds(build(locale), doc), locale, depth: 0, context, req });
  }
  return doc.id;
}

/** Update an existing document in every locale. */
export async function updateLocalized(
  payload: Payload,
  collection: CollectionSlug,
  id: number | string,
  build: (locale: Locale) => AnyData,
  { req }: WriteOptions = {},
): Promise<void> {
  const api = payload as unknown as LooseApi;
  let doc = await api.update({ collection, id, data: build(defaultLocale), locale: defaultLocale, depth: 0, context, req });
  for (const locale of otherLocales) {
    doc = await api.update({ collection, id, data: withRowIds(build(locale), doc), locale, depth: 0, context, req });
  }
}
