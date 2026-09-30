import type { CollectionConfig } from "payload";
import { managedSiteIds, siteContentAccess } from "../cms/access";
import { groups, t3 } from "../cms/labels";
import { revalidateCollection } from "../cms/revalidate";
import { locales } from "../i18n/config";
import { normalizeRedirectPath } from "../lib/redirects";

const localePrefix = new RegExp(`^/(${locales.join("|")})(/|$)`);

const fromPath = (value: string | null | undefined) =>
  (typeof value === "string" && /^\/[^\s#?]*$/.test(value) && !localePrefix.test(value)) ||
  "Path without language, starting with / (e.g. /services/basse-tension).";

const toTarget = (value: string | null | undefined) =>
  (typeof value === "string" &&
    ((/^\/(?!\/)[^\s]*$/.test(value) && !localePrefix.test(value)) || /^https:\/\/[^\s]+$/.test(value))) ||
  "Path without language (e.g. /services/installation-raccordee#commercial) or an https:// URL.";

/**
 * Old URL → new URL, in every language (plan §4.1: BT/MT pages merged into
 * "Installations raccordées"). Applied when a page isn't found, so a redirect
 * never hides a live page.
 */
export const Redirects: CollectionConfig = {
  slug: "redirects",
  labels: {
    singular: t3("Redirection", "Redirect", "إعادة توجيه"),
    plural: t3("Redirections", "Redirects", "إعادات التوجيه"),
  },
  admin: {
    useAsTitle: "from",
    defaultColumns: ["from", "to", "sites", "permanent"],
    group: groups.settings,
  },
  access: siteContentAccess("sites"),
  hooks: revalidateCollection("redirects"),
  fields: [
    {
      name: "from",
      type: "text",
      required: true,
      index: true,
      validate: fromPath,
      label: t3("Ancienne adresse", "Old address", "العنوان القديم"),
      hooks: { beforeValidate: [({ value }) => (typeof value === "string" ? normalizeRedirectPath(value) : value)] },
      admin: {
        description: t3(
          "Sans la langue : /services/basse-tension redirige /fr/…, /ar/… et /en/….",
          "Without the language: /services/basse-tension redirects /fr/…, /ar/… and /en/….",
          "بدون اللغة: ‎/services/basse-tension يعيد توجيه ‎/fr/… و‎/ar/… و‎/en/….",
        ),
      },
    },
    {
      name: "to",
      type: "text",
      required: true,
      validate: toTarget,
      label: t3("Nouvelle adresse", "New address", "العنوان الجديد"),
      admin: {
        description: t3(
          "Chemin sans la langue (une ancre #… est permise) ou adresse https:// externe.",
          "Path without the language (a #… anchor is allowed) or an external https:// address.",
          "مسار بدون اللغة (يُسمح بمرساة ‎#…) أو عنوان https://‎ خارجي.",
        ),
      },
    },
    {
      name: "sites",
      type: "relationship",
      relationTo: "sites",
      hasMany: true,
      label: t3("Sites", "Sites", "المواقع"),
      defaultValue: ({ user }: { user?: unknown }) => managedSiteIds(user)?.slice(0, 1),
      filterOptions: ({ user }) => {
        const ids = managedSiteIds(user);
        return ids ? { id: { in: ids } } : true;
      },
      admin: {
        position: "sidebar",
        description: t3("Vide = tous les sites.", "Empty = every site.", "فارغ = كل المواقع."),
      },
    },
    {
      name: "permanent",
      type: "checkbox",
      defaultValue: true,
      label: t3("Définitive (SEO)", "Permanent (SEO)", "دائمة (SEO)"),
      admin: {
        position: "sidebar",
        description: t3(
          "Les moteurs de recherche transfèrent le référencement vers la nouvelle adresse.",
          "Search engines transfer the ranking to the new address.",
          "تنقل محركات البحث الترتيب إلى العنوان الجديد.",
        ),
      },
    },
  ],
};
