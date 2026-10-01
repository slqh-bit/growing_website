import type { Field, GroupField, RelationshipField, TextField } from "payload";
import { managedSiteIds } from "./access";
import { t3 } from "./labels";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "Installation raccordée" → "installation-raccordee". */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * URL slug shared by all locales (devplan §4: "slugs shared across locales").
 * Auto-derived from `sourceField` when left empty. Per-site collections make
 * it unique per site instead (`unique: false` + a compound index).
 */
export function slugField(sourceField = "title", { unique = true }: { unique?: boolean } = {}): TextField {
  return {
    name: "slug",
    type: "text",
    label: t3("Slug (URL)", "Slug (URL)", "المعرّف (الرابط)"),
    required: true,
    unique,
    index: true,
    admin: {
      position: "sidebar",
      description: t3(
        "Segment d'URL commun aux 3 langues, ex. pompage-solaire. Généré depuis le titre si vide.",
        "URL segment shared by all 3 languages, e.g. pompage-solaire. Generated from the title if empty.",
        "جزء الرابط المشترك بين اللغات الثلاث، مثل pompage-solaire. يُولَّد من العنوان إن تُرك فارغاً.",
      ),
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (typeof value === "string" && value.trim()) return slugify(value);
          const source = data?.[sourceField];
          return typeof source === "string" ? slugify(source) : value;
        },
      ],
    },
    validate: (value: string | null | undefined) =>
      (typeof value === "string" && SLUG_PATTERN.test(value)) ||
      "Lowercase letters, digits and hyphens only (e.g. pompage-solaire).",
  };
}

/**
 * The website a document belongs to (plan §5). Editors can only pick the
 * sites they manage (Users → Sites gérés), and get their first one by default.
 */
export function siteField(): RelationshipField {
  return {
    name: "site",
    type: "relationship",
    relationTo: "sites",
    required: true,
    index: true,
    label: t3("Site", "Site", "الموقع"),
    defaultValue: ({ user }: { user?: unknown }) => managedSiteIds(user)?.[0],
    filterOptions: ({ user }) => {
      const ids = managedSiteIds(user);
      return ids ? { id: { in: ids } } : true;
    },
    admin: {
      position: "sidebar",
      description: t3(
        "Le site web qui publie ce contenu.",
        "The website that publishes this content.",
        "الموقع الذي ينشر هذا المحتوى.",
      ),
    },
  };
}

/** One slug per site: `[{ fields: ["site", "slug"], unique: true }]`. */
export const uniqueSlugPerSite = [{ fields: ["site", "slug"], unique: true }];

/** Per-document SEO overrides (localized). Falls back to title/summary. */
export const seoField: GroupField = {
  name: "seo",
  type: "group",
  label: "SEO",
  admin: {
    description: t3(
      "Optionnel — remplace le titre et la description utilisés par les moteurs de recherche.",
      "Optional — overrides the title and description used by search engines.",
      "اختياري — يعوّض العنوان والوصف المستعملين في محركات البحث.",
    ),
  },
  fields: [
    {
      name: "metaTitle",
      type: "text",
      localized: true,
      maxLength: 70,
      label: t3("Titre SEO", "Meta title", "عنوان SEO"),
    },
    {
      name: "metaDescription",
      type: "textarea",
      localized: true,
      maxLength: 160,
      label: t3("Description SEO", "Meta description", "وصف SEO"),
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
      label: t3("Image de partage", "Share image", "صورة المشاركة"),
    },
  ],
};

/** Internal path ("/services") or absolute https URL. */
export function validateHref(value: string | null | undefined): true | string {
  if (!value) return true;
  if (/^\/(?!\/)[^\s]*$/.test(value) || /^https:\/\/[^\s]+$/.test(value)) return true;
  return "Use an internal path starting with / (e.g. /devis) or an https:// URL.";
}

/** Locale-agnostic link: label is localized, href is shared. */
export function linkFields({ required = true }: { required?: boolean } = {}): Field[] {
  return [
    {
      name: "label",
      type: "text",
      localized: true,
      required,
      label: t3("Libellé", "Label", "النص"),
    },
    {
      name: "href",
      type: "text",
      required,
      label: t3("Lien", "Link", "الرابط"),
      admin: {
        description: t3(
          "Chemin sans langue, ex. /services — la langue est ajoutée automatiquement.",
          "Path without locale, e.g. /services — the locale is added automatically.",
          "مسار بدون لغة، مثل ‎/services — تُضاف اللغة تلقائياً.",
        ),
      },
      validate: validateHref,
    },
  ];
}
