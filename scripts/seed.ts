/**
 * Seed the CMS with the site's initial content (devplan Phase 1.3).
 *
 *   npm run seed
 *
 * Idempotent: documents are matched by a stable key (slug, activity, question,
 * email) and updated in place, so re-running never duplicates anything.
 * Sites are the exception: created only when missing (their identity, contacts
 * and brand are managed in the admin), and a missing logo is filled in.
 *
 * Content source: the typed modules in scripts/seed-data/ and the UI message
 * catalogs in messages/*.json. After seeding, the CMS is the source of truth:
 * the public site reads only from Payload.
 *
 * Admin user: created from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD (never a
 * hard-coded password). An existing user's password is never changed.
 */
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getPayload, type CollectionSlug, type Payload, type Where } from "payload";

import config from "../src/payload.config";
import { lexicalFromText } from "../src/cms/lexical";
import { faqItems } from "./seed-data/faq";
import { footerNav, legalNav, mainNav } from "./seed-data/navigation";
import { projects } from "./seed-data/projects";
import { services } from "./seed-data/services";
import { sites } from "./seed-data/site";
import { defaultLocale, locales, rtlLocales, type Locale } from "../src/i18n/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const otherLocales = locales.filter((l) => l !== defaultLocale);

type Messages = Record<string, Record<string, string | Record<string, string>>>;
const messages = Object.fromEntries(
  locales.map((l) => [
    l,
    JSON.parse(readFileSync(path.resolve(dirname, `../messages/${l}.json`), "utf8")) as Messages,
  ]),
) as Record<Locale, Messages>;

/** Read a UI string, e.g. msg("fr", "home.heroTitle") or msg("fr", "home.why.local"). */
function msg(locale: Locale, key: string): string {
  const value = key
    .split(".")
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], messages[locale]);
  if (typeof value !== "string") throw new Error(`Missing message "${key}" for locale "${locale}"`);
  return value;
}

const dirOf = (locale: Locale) => (rtlLocales.includes(locale) ? "rtl" : "ltr");
const rich = (text: string, locale: Locale) => lexicalFromText(text, dirOf(locale));

// ---------------------------------------------------------------------------
// Localized upsert helpers
// ---------------------------------------------------------------------------

/**
 * Keys whose arrays are `localized: true` (each locale owns its rows) or that
 * hold rich text. Their row ids must NOT be copied across locales.
 */
const SKIP_ID_KEYS = new Set(["benefits", "body", "content"]);

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Non-localized arrays/blocks share their rows across locales; only the
 * localized sub-fields differ. When writing ar/en we must therefore re-use the
 * row ids created for fr, otherwise Payload would treat them as new rows and
 * drop the French values.
 */
function withRowIds<T>(data: T, existing: unknown): T {
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

/** Seed writes skip cache revalidation: the CLI process has no page cache. */
const context = { disableRevalidate: true };

/* The Local API's per-collection generics don't narrow inside a generic helper,
   so these helpers take plain objects. Payload still validates every field at
   runtime (required, select options, custom validators) and throws on bad data. */
type AnyData = Record<string, unknown>;
type LooseApi = {
  find(args: object): Promise<{ docs: { id: number | string }[] }>;
  create(args: object): Promise<{ id: number | string } & AnyData>;
  update(args: object): Promise<{ id: number | string } & AnyData>;
  updateGlobal(args: object): Promise<AnyData>;
};

async function upsert(
  payload: Payload,
  collection: CollectionSlug,
  where: Where,
  build: (locale: Locale) => AnyData,
): Promise<number | string> {
  const api = payload as unknown as LooseApi;
  const found = await api.find({ collection, where, limit: 1, depth: 0, locale: defaultLocale });
  const existingId = found.docs[0]?.id;

  let doc =
    existingId !== undefined
      ? await api.update({ collection, id: existingId, data: build(defaultLocale), locale: defaultLocale, depth: 0, context })
      : await api.create({ collection, data: build(defaultLocale), locale: defaultLocale, depth: 0, context });

  for (const locale of otherLocales) {
    doc = await api.update({ collection, id: doc.id, data: withRowIds(build(locale), doc), locale, depth: 0, context });
  }
  return doc.id;
}

async function upsertGlobal(payload: Payload, slug: string, build: (locale: Locale) => AnyData) {
  const api = payload as unknown as LooseApi;
  let doc = await api.updateGlobal({ slug, data: build(defaultLocale), locale: defaultLocale, depth: 0, context });
  for (const locale of otherLocales) {
    doc = await api.updateGlobal({ slug, data: withRowIds(build(locale), doc), locale, depth: 0, context });
  }
}

// ---------------------------------------------------------------------------
// Seed steps
// ---------------------------------------------------------------------------

async function seedAdmin(payload: Payload) {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  const { totalDocs } = await payload.count({ collection: "users" });
  if (!email || !password) {
    payload.logger.warn(
      totalDocs === 0
        ? "No SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD: no admin created. Create the first user at /admin."
        : "No SEED_ADMIN_* variables: leaving existing users untouched.",
    );
    return;
  }
  if (password.length < 12) throw new Error("SEED_ADMIN_PASSWORD must be at least 12 characters.");

  const existing = await payload.find({ collection: "users", where: { email: { equals: email } }, limit: 1 });
  if (existing.docs[0]) {
    payload.logger.info(`Admin ${email} already exists (password unchanged).`);
    return;
  }
  await payload.create({
    collection: "users",
    data: { email, password, name: "Administrateur", role: "admin" },
  });
  payload.logger.info(`Admin ${email} created.`);
}

async function seedServices(payload: Payload) {
  const ids = {} as Record<string, number | string>;
  for (const s of services) {
    ids[s.activityKey] = await upsert(payload, "services", { slug: { equals: s.slug } }, (l) => ({
      title: s.title[l],
      slug: s.slug,
      activityKey: s.activityKey,
      icon: s.icon,
      order: s.order,
      shortDescription: s.shortDescription[l],
      body: rich(s.body[l], l),
      benefits: s.benefits[l].map((text) => ({ text })),
      process: s.process.map((step) => ({ title: step.title[l], description: step.description[l] })),
    }));
  }
  payload.logger.info(`Services: ${services.length}`);
  return ids;
}

async function seedProjects(payload: Payload, serviceIds: Record<string, number | string>) {
  for (const p of projects) {
    const activity = serviceIds[p.activityKey];
    if (activity === undefined) throw new Error(`No service for activity "${p.activityKey}"`);
    await upsert(payload, "projects", { slug: { equals: p.slug } }, (l) => ({
      title: p.title[l],
      slug: p.slug,
      activity,
      clientType: p.clientType,
      region: p.region[l],
      powerKwc: p.powerKwc,
      summary: p.summary[l],
      body: rich(p.body[l], l),
      date: new Date(p.date).toISOString(),
      featured: p.featured,
    }));
  }
  payload.logger.info(`Projects: ${projects.length}`);
}

async function seedFaq(payload: Payload) {
  for (const f of faqItems) {
    await upsert(payload, "faq", { question: { equals: f.question[defaultLocale] } }, (l) => ({
      question: f.question[l],
      answer: f.answer[l],
      category: f.category[l],
      order: f.order,
    }));
  }
  payload.logger.info(`FAQ: ${faqItems.length}`);
}

function homeLayout(l: Locale) {
  const why = [
    ["ShieldCheck", "certified"],
    ["MapPin", "local"],
    ["Wrench", "turnkey"],
    ["Headphones", "support"],
  ] as const;
  return [
    {
      blockType: "hero",
      style: "full",
      badge: msg(l, "home.heroBadge"),
      title: msg(l, "home.heroTitle"),
      subtitle: msg(l, "home.heroSubtitle"),
      primaryCta: { label: msg(l, "common.requestQuote"), href: "/devis" },
      secondaryCta: { label: msg(l, "common.discoverServices"), href: "/services" },
    },
    { blockType: "stats", title: msg(l, "home.statsTitle"), useSiteStats: true },
    {
      blockType: "activityGrid",
      title: msg(l, "home.activitiesTitle"),
      subtitle: msg(l, "home.activitiesSubtitle"),
    },
    {
      blockType: "features",
      title: msg(l, "home.whyTitle"),
      subtitle: msg(l, "home.whySubtitle"),
      items: why.map(([icon, key]) => ({
        icon,
        title: msg(l, `home.why.${key}`),
        description: msg(l, `home.why.${key}Body`),
      })),
    },
    {
      blockType: "projects",
      title: msg(l, "home.projectsTitle"),
      subtitle: msg(l, "home.projectsSubtitle"),
      limit: 3,
    },
    {
      blockType: "cta",
      title: msg(l, "home.ctaTitle"),
      subtitle: msg(l, "home.ctaSubtitle"),
      button: { label: msg(l, "common.requestQuote"), href: "/devis" },
    },
  ];
}

function aboutLayout(l: Locale) {
  const values = [
    ["Award", "quality"],
    ["Heart", "proximity"],
    ["Eye", "transparency"],
  ] as const;
  return [
    {
      blockType: "hero",
      style: "compact",
      badge: sites[0]!.certification,
      title: msg(l, "about.title"),
      subtitle: msg(l, "about.subtitle"),
    },
    { blockType: "richText", title: msg(l, "about.storyTitle"), content: rich(msg(l, "about.story"), l) },
    { blockType: "stats", title: msg(l, "home.statsTitle"), useSiteStats: true },
    {
      blockType: "features",
      title: msg(l, "about.valuesTitle"),
      items: values.map(([icon, key]) => ({
        icon,
        title: msg(l, `about.values.${key}`),
        description: msg(l, `about.values.${key}Body`),
      })),
    },
    {
      blockType: "cta",
      title: msg(l, "home.ctaTitle"),
      subtitle: msg(l, "home.ctaSubtitle"),
      button: { label: msg(l, "common.requestQuote"), href: "/devis" },
    },
  ];
}

async function seedPages(payload: Payload) {
  const pages = [
    { slug: "home", titleKey: "nav.home", layout: homeLayout },
    { slug: "about", titleKey: "nav.about", layout: aboutLayout },
  ];
  for (const page of pages) {
    await upsert(payload, "pages", { slug: { equals: page.slug } }, (l) => ({
      title: msg(l, page.titleKey),
      slug: page.slug,
      layout: page.layout(l),
    }));
  }
  payload.logger.info(`Pages: ${pages.map((p) => p.slug).join(", ")}`);
}

async function seedSites(payload: Payload) {
  for (const s of sites) {
    const build = (l: Locale) => ({
      key: s.key,
      isDefault: s.isDefault,
      companyName: s.companyName,
      legalName: s.legalName,
      matriculeFiscal: s.matriculeFiscal,
      certification: s.certification || null,
      tagline: s.tagline[l],
      monogram: s.monogram,
      theme: s.theme,
      email: s.email,
      phone: s.phone,
      whatsapp: s.whatsapp || null,
      telegram: s.telegram || null,
      address: s.address[l],
      city: s.city[l],
      hours: msg(l, "contact.hoursValue"),
      coords: s.coords,
      socials: {
        facebook: s.socials.facebook || null,
        instagram: s.socials.instagram || null,
        linkedin: s.socials.linkedin || null,
      },
      stats: s.stats.map((stat) => ({ value: stat.value, label: stat.label[l] })),
    });

    const found = await payload.find({ collection: "sites", where: { key: { equals: s.key } }, limit: 1, depth: 0 });
    let site = found.docs[0];
    if (!site) {
      await upsert(payload, "sites", { key: { equals: s.key } }, build);
      site = (await payload.find({ collection: "sites", where: { key: { equals: s.key } }, limit: 1, depth: 0 })).docs[0]!;
      payload.logger.info(`Site ${s.key} created.`);
    }

    if (s.logoFile && !site.logo) {
      const logo = await uploadImage(payload, s.logoFile, () => `${s.companyName} — logo`);
      await payload.update({ collection: "sites", id: site.id, data: { logo }, depth: 0, context });
      payload.logger.info(`Site ${s.key}: logo uploaded.`);
    }
  }
  payload.logger.info(`Sites: ${sites.map((s) => s.key).join(", ")}`);
}

/** Uploads an image from the repo into Media (alt text in every locale). */
async function uploadImage(payload: Payload, file: string, alt: (l: Locale) => string): Promise<number> {
  const media = await payload.create({
    collection: "media",
    data: { alt: alt(defaultLocale) },
    filePath: path.resolve(dirname, "..", file),
    locale: defaultLocale,
    depth: 0,
    context,
  });
  for (const locale of otherLocales) {
    await payload.update({ collection: "media", id: media.id, data: { alt: alt(locale) }, locale, depth: 0, context });
  }
  return media.id;
}

async function seedGlobals(payload: Payload) {
  await upsertGlobal(payload, "navigation", (l) => ({
    items: mainNav.map((item) => ({
      label: msg(l, `nav.${item.labelKey}`),
      href: item.href,
      comingSoon: Boolean(item.comingSoon),
    })),
  }));

  const toLinks = (l: Locale, items: typeof footerNav) =>
    items.map((item) => ({ label: msg(l, `nav.${item.labelKey}`), href: item.href }));
  await upsertGlobal(payload, "footer", (l) => ({
    tagline: msg(l, "footer.tagline"),
    quickLinks: toLinks(l, footerNav),
    legalLinks: toLinks(l, legalNav),
  }));
  payload.logger.info("Globals: navigation, footer");
}

// ---------------------------------------------------------------------------

async function main() {
  const payload = await getPayload({ config });
  payload.logger.info(`Seeding locales: ${locales.join(", ")} (base: ${defaultLocale})`);

  await seedAdmin(payload);
  const serviceIds = await seedServices(payload);
  await seedProjects(payload, serviceIds);
  await seedFaq(payload);
  await seedPages(payload);
  await seedSites(payload);
  await seedGlobals(payload);

  payload.logger.info("Seed complete.");
}

// Top-level await: `payload run` exits as soon as this module's import settles,
// so the seed must finish before then. Errors propagate to the CLI (exit 1).
await main();
