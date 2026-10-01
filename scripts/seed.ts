/**
 * Seed the CMS with each site's initial content (plan §2: seed data only).
 *
 *   npm run seed
 *
 * Create-only and idempotent: documents are matched by a stable key (site +
 * slug, question, email, redirect path) and only created when missing, so
 * re-running never duplicates anything and never overwrites what was edited
 * in the admin. A site's missing logo is filled in.
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
import { createLocalized } from "../src/cms/localized-write";
import type { SiteKey } from "../src/sites/config";
import { rich, serviceData } from "./seed-data/build";
import { faqItems } from "./seed-data/faq";
import { crossSell, group } from "./seed-data/group";
import { devisForms, type SeedForm } from "./seed-data/devis-forms";
import { hikviewAbout, hikviewFooterTagline, hikviewHome } from "./seed-data/hikview";
import { hikviewServices } from "./seed-data/hikview-services";
import { footerNav, legalNav, mainNav, type NavItem } from "./seed-data/navigation";
import { projects } from "./seed-data/projects";
import { redirects } from "./seed-data/redirects";
import { services } from "./seed-data/services";
import { sites } from "./seed-data/site";
import { defaultLocale, locales, type Locale } from "../src/i18n/config";

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

/** Seed writes skip cache revalidation: the CLI process has no page cache. */
const context = { disableRevalidate: true };

type Id = number | string;
type AnyData = Record<string, unknown>;

/** Creates the document (all locales) unless one matches `where`. Returns its id and whether it was created. */
async function ensure(
  payload: Payload,
  collection: CollectionSlug,
  where: Where,
  build: (locale: Locale) => AnyData,
): Promise<{ id: Id; created: boolean }> {
  const found = await payload.find({ collection, where, limit: 1, depth: 0 });
  if (found.docs[0]) return { id: found.docs[0].id, created: false };
  return { id: await createLocalized(payload, collection, build), created: true };
}

const bySiteAnd = (site: Id, where: Where): Where => ({ and: [{ site: { equals: site } }, where] });

function report(payload: Payload, label: string, results: { created: boolean }[]) {
  const created = results.filter((r) => r.created).length;
  payload.logger.info(`${label}: ${created} created, ${results.length - created} already there`);
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

const navLinks = (l: Locale, items: NavItem[]) =>
  items.map((item) => ({ label: msg(l, `nav.${item.labelKey}`), href: item.href }));

async function seedSites(payload: Payload): Promise<Record<SiteKey, Id | undefined>> {
  const ids: Record<SiteKey, Id | undefined> = { growing: undefined, hikview: undefined, group: undefined };
  const results = [];
  for (const s of sites) {
    const footerTagline = s.key === "hikview" ? hikviewFooterTagline : null;
    const result = await ensure(payload, "sites", { key: { equals: s.key } }, (l) => ({
      key: s.key,
      isDefault: s.isDefault,
      companyName: s.companyName,
      legalName: s.legalName,
      matriculeFiscal: s.matriculeFiscal,
      certification: s.certification || null,
      businessType: s.businessType,
      tagline: s.tagline[l],
      servicesIntro: s.servicesIntro[l],
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
      navItems: mainNav.map((item) => ({
        label: msg(l, `nav.${item.labelKey}`),
        href: item.href,
        comingSoon: Boolean(item.comingSoon),
      })),
      footer: {
        tagline: footerTagline ? footerTagline[l] : msg(l, "footer.tagline"),
        quickLinks: navLinks(l, footerNav),
        legalLinks: navLinks(l, legalNav),
      },
    }));
    results.push(result);
    ids[s.key] = result.id;

    const site = await payload.findByID({ collection: "sites", id: result.id, depth: 0 });
    if (s.logoFile && !site.logo) {
      const logo = await uploadImage(payload, s.logoFile, () => `${s.companyName} — logo`);
      await payload.update({ collection: "sites", id: site.id, data: { logo }, depth: 0, context });
      payload.logger.info(`Site ${s.key}: logo uploaded.`);
    }
  }
  report(payload, "Sites", results);
  return ids;
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

async function seedServices(payload: Payload, site: Id) {
  const ids: Record<string, Id> = {};
  const results = [];
  for (const s of services) {
    const result = await ensure(payload, "services", bySiteAnd(site, { slug: { equals: s.slug } }), (l) =>
      serviceData(s, l, site),
    );
    results.push(result);
    if (s.activityKey) ids[s.activityKey] = result.id;
  }
  report(payload, "Growing services", results);
  return ids;
}

/** Hikview's areas first, then their sub-services (parent = the area). */
async function seedHikviewServices(payload: Payload, site: Id) {
  const ids: Record<string, Id> = {};
  const results = [];
  const ordered = [...hikviewServices.filter((s) => !s.parent), ...hikviewServices.filter((s) => s.parent)];
  for (const s of ordered) {
    const parent = s.parent ? ids[s.parent] : null;
    if (s.parent && parent === undefined) throw new Error(`Unknown area "${s.parent}" for "${s.slug}"`);
    const result = await ensure(payload, "services", bySiteAnd(site, { slug: { equals: s.slug } }), (l) =>
      serviceData(s, l, site, { parent, showPublicReferences: s.showPublicReferences }),
    );
    ids[s.slug] = result.id;
    results.push(result);
  }
  report(payload, "Hikview services", results);
}

async function seedProjects(payload: Payload, site: Id, serviceIds: Record<string, Id>) {
  const results = [];
  for (const p of projects) {
    const activity = serviceIds[p.activityKey];
    if (activity === undefined) throw new Error(`No service for activity "${p.activityKey}"`);
    results.push(
      await ensure(payload, "projects", bySiteAnd(site, { slug: { equals: p.slug } }), (l) => ({
        site,
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
      })),
    );
  }
  report(payload, "Growing projects", results);
}

async function seedFaq(payload: Payload, site: Id) {
  const results = [];
  for (const f of faqItems) {
    results.push(
      await ensure(payload, "faq", bySiteAnd(site, { question: { equals: f.question[defaultLocale] } }), (l) => ({
        site,
        question: f.question[l],
        answer: f.answer[l],
        category: f.category[l],
        order: f.order,
      })),
    );
  }
  report(payload, "Growing FAQ", results);
}

/** "Bientôt disponible" cards (plan Phase 9): client area, careers, news. */
function upcomingBlock(l: Locale) {
  const items = [
    ["UserRound", "nav.clientArea", "upcoming.clientArea.card", "/espace-client"],
    ["Briefcase", "nav.careers", "upcoming.careers.card", "/carrieres"],
    ["Newspaper", "nav.blog", "upcoming.news.card", "/blog"],
  ] as const;
  return {
    blockType: "upcoming",
    title: msg(l, "upcoming.title"),
    subtitle: msg(l, "upcoming.subtitle"),
    items: items.map(([icon, title, description, href]) => ({
      icon,
      title: msg(l, title),
      description: msg(l, description),
      href,
    })),
  };
}

function growingHome(l: Locale) {
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
    upcomingBlock(l),
    {
      blockType: "cta",
      title: msg(l, "home.ctaTitle"),
      subtitle: msg(l, "home.ctaSubtitle"),
      button: { label: msg(l, "common.requestQuote"), href: "/devis" },
    },
  ];
}

function growingAbout(l: Locale) {
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

function hikviewHomeLayout(l: Locale) {
  const h = hikviewHome;
  return [
    {
      blockType: "hero",
      style: "full",
      badge: h.heroBadge[l],
      title: h.heroTitle[l],
      subtitle: h.heroSubtitle[l],
      primaryCta: { label: msg(l, "nav.contact"), href: "/contact" },
      secondaryCta: { label: msg(l, "common.discoverServices"), href: "/services" },
    },
    { blockType: "activityGrid", title: h.activitiesTitle[l], subtitle: h.activitiesSubtitle[l] },
    {
      blockType: "features",
      title: h.whyTitle[l],
      items: h.why.map((item) => ({ icon: item.icon, title: item.title[l], description: item.description[l] })),
    },
    // Both hidden until references / partners are added in the admin.
    { blockType: "projects", title: h.projectsTitle[l], subtitle: h.projectsSubtitle[l], limit: 3 },
    { blockType: "partners", title: h.partnersTitle[l] },
    upcomingBlock(l),
    {
      blockType: "cta",
      title: h.ctaTitle[l],
      subtitle: h.ctaSubtitle[l],
      button: { label: msg(l, "nav.contact"), href: "/contact" },
    },
  ];
}

function hikviewAboutLayout(l: Locale) {
  const a = hikviewAbout;
  return [
    { blockType: "hero", style: "compact", title: a.title[l], subtitle: a.subtitle[l] },
    { blockType: "richText", title: a.storyTitle[l], content: rich(a.story[l], l) },
    {
      blockType: "cta",
      title: hikviewHome.ctaTitle[l],
      subtitle: hikviewHome.ctaSubtitle[l],
      button: { label: msg(l, "nav.contact"), href: "/contact" },
    },
  ];
}

async function seedPages(payload: Payload, siteIds: Record<SiteKey, Id | undefined>) {
  const pages = [
    { site: siteIds.growing, slug: "home", title: (l: Locale) => msg(l, "nav.home"), layout: growingHome },
    { site: siteIds.growing, slug: "about", title: (l: Locale) => msg(l, "nav.about"), layout: growingAbout },
    { site: siteIds.hikview, slug: "home", title: (l: Locale) => msg(l, "nav.home"), layout: hikviewHomeLayout },
    { site: siteIds.hikview, slug: "about", title: (l: Locale) => msg(l, "nav.about"), layout: hikviewAboutLayout },
  ];
  const results = [];
  for (const page of pages) {
    if (page.site === undefined) continue;
    const site = page.site;
    results.push(
      await ensure(payload, "pages", bySiteAnd(site, { slug: { equals: page.slug } }), (l) => ({
        site,
        title: page.title(l),
        slug: page.slug,
        layout: page.layout(l),
      })),
    );
  }
  report(payload, "Pages", results);
}

async function seedRedirects(payload: Payload, siteIds: Record<SiteKey, Id | undefined>) {
  const results = [];
  for (const r of redirects) {
    const site = siteIds[r.site];
    if (site === undefined) continue;
    const found = await payload.find({ collection: "redirects", where: { from: { equals: r.from } }, limit: 1, depth: 0 });
    if (found.docs[0]) {
      results.push({ created: false });
      continue;
    }
    await payload.create({
      collection: "redirects",
      data: { from: r.from, to: r.to, sites: [Number(site)], permanent: true },
      depth: 0,
      context,
    });
    results.push({ created: true });
  }
  report(payload, "Redirects", results);
}

/** One locale of a seeded quote form. */
function formData(form: SeedForm, l: Locale, site: Id) {
  const text = (v: unknown) => (v && typeof v === "object" ? ((v as Record<Locale, string>)[l] ?? null) : null);
  return {
    site,
    title: form.title,
    attachments: {
      mode: form.attachments?.mode ?? "optional",
      label: text(form.attachments?.label),
      help: text(form.attachments?.help),
    },
    questions: form.questions.map((q) => ({
      name: q.name,
      type: q.type,
      label: text(q.label),
      help: text(q.help),
      unit: text(q.unit),
      required: Boolean(q.required),
      requiredGroup: q.requiredGroup ?? null,
      min: q.min ?? null,
      max: q.max ?? null,
      width: q.width ?? "half",
      options: (q.options ?? []).map((o) => ({ value: o.value, label: text(o.label) })),
      showIf: { field: q.showIf?.field ?? null, equals: q.showIf?.equals ?? null },
    })),
  };
}

/** Quote forms, and each service's form when it has none yet. */
async function seedDevisForms(payload: Payload, siteIds: Record<SiteKey, Id | undefined>) {
  const results = [];
  let linked = 0;
  for (const form of devisForms) {
    const site = siteIds[form.site];
    if (site === undefined) continue;
    const result = await ensure(payload, "devis-forms", bySiteAnd(site, { title: { equals: form.title } }), (l) =>
      formData(form, l, site),
    );
    results.push(result);
    for (const slug of form.services) {
      const service = (
        await payload.find({ collection: "services", where: bySiteAnd(site, { slug: { equals: slug } }), limit: 1, depth: 0 })
      ).docs[0];
      if (!service || service.devisForm) continue;
      await payload.update({ collection: "services", id: service.id, data: { devisForm: Number(result.id) }, depth: 0, context });
      linked++;
    }
  }
  report(payload, "Quote forms", results);
  payload.logger.info(`Quote forms: ${linked} services linked`);
}

/** The group global, unless it was already filled in the admin. */
async function seedGroup(payload: Payload, siteIds: Record<SiteKey, Id | undefined>) {
  const current = await payload.findGlobal({ slug: "group", depth: 0 });
  if ((current.members ?? []).length > 0) {
    payload.logger.info("Group: already configured");
    return;
  }
  const members = group.members.filter((m) => siteIds[m.site] !== undefined);
  let doc: AnyData | undefined;
  for (const l of locales) {
    const data = {
      name: group.name[l],
      tagline: group.tagline[l],
      story: rich(group.story[l], l),
      footerBand: true,
      members: members.map((m, i) => ({
        ...(doc ? { id: ((doc.members as { id?: string }[] | undefined) ?? [])[i]?.id } : {}),
        site: Number(siteIds[m.site]),
        summary: m.summary[l],
      })),
    };
    doc = (await payload.updateGlobal({ slug: "group", data, locale: l, depth: 0, context })) as unknown as AnyData;
  }
  payload.logger.info("Group: created");
}

/** Default cross-selling, only on services that have none yet. */
async function seedCrossSell(payload: Payload, siteIds: Record<SiteKey, Id | undefined>) {
  const find = async (site: SiteKey, slug: string) => {
    const siteId = siteIds[site];
    if (siteId === undefined) return undefined;
    return (await payload.find({ collection: "services", where: bySiteAnd(siteId, { slug: { equals: slug } }), limit: 1, depth: 0 }))
      .docs[0];
  };
  let filled = 0;
  for (const rule of crossSell) {
    const from = await find(...rule.from);
    if (!from || (from.crossSell ?? []).length > 0) continue;
    const targets = (await Promise.all(rule.to.map(([site, slug]) => find(site, slug)))).filter((s) => s !== undefined);
    if (targets.length === 0) continue;
    await payload.update({ collection: "services", id: from.id, data: { crossSell: targets.map((t) => t.id) }, depth: 0, context });
    filled++;
  }
  payload.logger.info(`Cross-selling: ${filled} services filled`);
}

// ---------------------------------------------------------------------------

async function main() {
  const payload = await getPayload({ config });
  payload.logger.info(`Seeding locales: ${locales.join(", ")} (base: ${defaultLocale})`);

  await seedAdmin(payload);
  const siteIds = await seedSites(payload);
  const growing = siteIds.growing;
  if (growing !== undefined) {
    const serviceIds = await seedServices(payload, growing);
    await seedProjects(payload, growing, serviceIds);
    await seedFaq(payload, growing);
  }
  if (siteIds.hikview !== undefined) await seedHikviewServices(payload, siteIds.hikview);
  await seedPages(payload, siteIds);
  await seedRedirects(payload, siteIds);
  await seedDevisForms(payload, siteIds);
  await seedGroup(payload, siteIds);
  await seedCrossSell(payload, siteIds);

  payload.logger.info("Seed complete.");
}

// Top-level await: `payload run` exits as soon as this module's import settles,
// so the seed must finish before then. Errors propagate to the CLI (exit 1).
await main();
