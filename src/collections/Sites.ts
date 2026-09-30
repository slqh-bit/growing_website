import type { CollectionAfterChangeHook, CollectionConfig } from "payload";
import { admins, anyone } from "../cms/access";
import { groups, t3 } from "../cms/labels";
import { revalidateCollection } from "../cms/revalidate";
import { HEX_COLOR } from "../lib/theme";
import { normalizeHost, siteKeys } from "../sites/config";

const httpsUrl = (value: string | null | undefined) =>
  !value || /^https:\/\/[^\s]+$/.test(value) || "Use an https:// URL.";

const origin = (value: string | null | undefined) =>
  !value || /^https?:\/\/[^\s/]+$/.test(value) || "Origin only, e.g. https://growing-technologies.tn (no path).";

const hostname = (value: string | null | undefined) =>
  (typeof value === "string" && normalizeHost(value) === value.trim().toLowerCase() && value !== "localhost") ||
  "Domain only, e.g. growing-technologies.tn (no https://, no path).";

const hexColor = (value: string | null | undefined) =>
  !value || HEX_COLOR.test(value) || "Hex colour, e.g. #1f6fd1.";

const siteLabels = {
  growing: "Growing Technologies",
  hikview: "Hikview Engineering",
  group: t3("Groupe", "Group", "المجموعة"),
} as const;

/** Only one site can be the fallback for unknown domains. */
const keepSingleDefault: CollectionAfterChangeHook = async ({ doc, req, context }) => {
  if (!doc.isDefault || context.skipSingleDefault) return doc;
  const { docs } = await req.payload.find({
    collection: "sites",
    where: { and: [{ isDefault: { equals: true } }, { id: { not_equals: doc.id } }] },
    depth: 0,
    req,
  });
  for (const other of docs) {
    await req.payload.update({
      collection: "sites",
      id: other.id,
      data: { isDefault: false },
      depth: 0,
      req,
      context: { ...context, skipSingleDefault: true },
    });
  }
  return doc;
};

const revalidate = revalidateCollection("sites");

/**
 * The group's websites (plan §2, §5): one document per site with its domains,
 * company identity, contacts, key figures and brand (logo, colours). Replaces
 * the former single "Site settings" global — field names are unchanged.
 */
export const Sites: CollectionConfig = {
  slug: "sites",
  labels: {
    singular: t3("Site", "Site", "موقع"),
    plural: t3("Sites", "Sites", "المواقع"),
  },
  admin: {
    useAsTitle: "companyName",
    defaultColumns: ["companyName", "key", "isDefault", "updatedAt"],
    group: groups.settings,
  },
  access: {
    read: anyone,
    // Legal identifiers, contacts and domains: admins only.
    create: admins,
    update: admins,
    delete: admins,
  },
  hooks: {
    afterChange: [keepSingleDefault, ...revalidate.afterChange],
    afterDelete: revalidate.afterDelete,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: t3("Site web", "Website", "الموقع"),
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "key",
                  type: "select",
                  required: true,
                  unique: true,
                  label: t3("Site", "Site", "الموقع"),
                  options: siteKeys.map((value) => ({ value, label: siteLabels[value] })),
                  admin: {
                    description: t3(
                      "Identifiant technique du site (ne pas changer après la mise en ligne).",
                      "Technical id of the site (don't change it once live).",
                      "المعرّف التقني للموقع (لا يُغيَّر بعد النشر).",
                    ),
                  },
                },
                {
                  name: "isDefault",
                  type: "checkbox",
                  defaultValue: false,
                  label: t3("Site par défaut", "Default site", "الموقع الافتراضي"),
                  admin: {
                    description: t3(
                      "Affiché pour un nom de domaine inconnu (et en local sur localhost).",
                      "Shown for an unknown domain (and locally on localhost).",
                      "يُعرض لاسم نطاق غير معروف (ومحلياً على localhost).",
                    ),
                  },
                },
              ],
            },
            {
              name: "url",
              type: "text",
              validate: origin,
              label: t3("Adresse publique", "Public address", "العنوان العمومي"),
              admin: {
                description: t3(
                  "Ex. https://growing-technologies.tn — utilisée pour les liens canoniques, le partage et le SEO. Vide = NEXT_PUBLIC_SITE_URL.",
                  "E.g. https://growing-technologies.tn — used for canonical links, sharing and SEO. Empty = NEXT_PUBLIC_SITE_URL.",
                  "مثال https://growing-technologies.tn — يُستعمل للروابط الأساسية والمشاركة وSEO. فارغ = NEXT_PUBLIC_SITE_URL.",
                ),
              },
            },
            {
              name: "domains",
              type: "array",
              label: t3("Noms de domaine", "Domains", "أسماء النطاقات"),
              labels: {
                singular: t3("Domaine", "Domain", "نطاق"),
                plural: t3("Domaines", "Domains", "نطاقات"),
              },
              admin: {
                description: t3(
                  "Domaines qui affichent ce site (le www. est reconnu automatiquement). En local : <site>.localhost:3000.",
                  "Domains that show this site (www. is matched automatically). Locally: <site>.localhost:3000.",
                  "النطاقات التي تعرض هذا الموقع (يُتعرّف على www. تلقائياً). محلياً: ‎<site>.localhost:3000.",
                ),
              },
              fields: [{ name: "domain", type: "text", required: true, validate: hostname, label: t3("Domaine", "Domain", "النطاق") }],
            },
          ],
        },
        {
          label: t3("Entreprise", "Company", "الشركة"),
          fields: [
            {
              type: "row",
              fields: [
                { name: "companyName", type: "text", required: true, label: t3("Nom commercial", "Trade name", "الاسم التجاري") },
                { name: "legalName", type: "text", required: true, label: t3("Raison sociale", "Legal name", "الاسم القانوني") },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "matriculeFiscal",
                  type: "text",
                  required: true,
                  label: t3("Matricule fiscal", "Tax ID (matricule fiscal)", "المعرّف الجبائي"),
                  admin: { description: "Format : 1234567/A/B/M/000" },
                },
                { name: "certification", type: "text", label: t3("Certification", "Certification", "الاعتماد") },
              ],
            },
            {
              name: "tagline",
              type: "text",
              localized: true,
              required: true,
              label: t3("Slogan", "Tagline", "الشعار النصي"),
              admin: {
                description: t3(
                  "Une phrase : titre de l'onglet, moteurs de recherche, visuel d'accueil.",
                  "One sentence: browser tab title, search engines, home visual.",
                  "جملة واحدة: عنوان التبويب، محركات البحث، صورة الصفحة الرئيسية.",
                ),
              },
            },
          ],
        },
        {
          label: t3("Marque", "Brand", "الهوية البصرية"),
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "logo",
                  type: "upload",
                  relationTo: "media",
                  label: t3("Logo", "Logo", "الشعار"),
                  admin: {
                    description: t3(
                      "PNG/WebP, fond transparent. Vide = pastille avec les initiales ci-dessous.",
                      "PNG/WebP, transparent background. Empty = badge with the initials below.",
                      "PNG/WebP بخلفية شفافة. فارغ = شارة بالأحرف الأولى أدناه.",
                    ),
                  },
                },
                {
                  name: "logoDark",
                  type: "upload",
                  relationTo: "media",
                  label: t3("Logo (mode sombre)", "Logo (dark mode)", "الشعار (الوضع الداكن)"),
                  admin: {
                    description: t3("Optionnel.", "Optional.", "اختياري."),
                  },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "logoIncludesName",
                  type: "checkbox",
                  defaultValue: false,
                  label: t3("Le logo contient déjà le nom", "The logo already contains the name", "الشعار يتضمّن الاسم"),
                  admin: {
                    description: t3(
                      "Coché : le nom de l'entreprise n'est pas écrit à côté du logo.",
                      "Checked: the company name isn't written next to the logo.",
                      "عند التحديد: لا يُكتب اسم الشركة بجانب الشعار.",
                    ),
                  },
                },
                {
                  name: "monogram",
                  type: "text",
                  maxLength: 3,
                  label: t3("Initiales (pastille)", "Initials (badge)", "الأحرف الأولى (الشارة)"),
                  admin: {
                    description: t3(
                      "Ex. GT — utilisées quand aucun logo n'est chargé.",
                      "E.g. GT — used when no logo is uploaded.",
                      "مثال GT — تُستعمل عند غياب الشعار.",
                    ),
                  },
                },
              ],
            },
            {
              name: "favicon",
              type: "upload",
              relationTo: "media",
              label: t3("Icône d'onglet (favicon)", "Tab icon (favicon)", "أيقونة التبويب"),
              admin: {
                description: t3(
                  "PNG carré, 512×512 conseillé.",
                  "Square PNG, 512×512 recommended.",
                  "صورة PNG مربّعة، يُنصح بـ 512×512.",
                ),
              },
            },
            {
              name: "theme",
              type: "group",
              label: t3("Couleurs", "Colours", "الألوان"),
              admin: {
                description: t3(
                  "Code hexadécimal (#1f6fd1). La teinte et l'intensité sont reprises ; la clarté est ajustée automatiquement pour garder un texte lisible. Vide = palette par défaut (vert solaire / or).",
                  "Hex code (#1f6fd1). Hue and intensity are used; lightness is adjusted automatically to keep text readable. Empty = default palette (solar green / gold).",
                  "رمز ست عشري (‎#1f6fd1). تُعتمد درجة اللون وشدّته؛ ويُضبط السطوع تلقائياً للحفاظ على وضوح النص. فارغ = الألوان الافتراضية (أخضر شمسي / ذهبي).",
                ),
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "primary", type: "text", validate: hexColor, label: t3("Couleur principale", "Primary colour", "اللون الرئيسي") },
                    { name: "accent", type: "text", validate: hexColor, label: t3("Couleur d'accent", "Accent colour", "لون التمييز") },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: t3("Contact", "Contact", "الاتصال"),
          fields: [
            {
              type: "row",
              fields: [
                { name: "email", type: "email", required: true, label: t3("E-mail", "Email", "البريد الإلكتروني") },
                { name: "phone", type: "text", required: true, label: t3("Téléphone", "Phone", "الهاتف") },
              ],
            },
            {
              type: "row",
              fields: [
                { name: "whatsapp", type: "text", label: "WhatsApp" },
                { name: "telegram", type: "text", label: "Telegram", admin: { description: "@username" } },
              ],
            },
            { name: "address", type: "textarea", localized: true, required: true, label: t3("Adresse", "Address", "العنوان") },
            {
              type: "row",
              fields: [
                { name: "city", type: "text", localized: true, required: true, label: t3("Ville", "City", "المدينة") },
                { name: "hours", type: "text", localized: true, label: t3("Horaires", "Opening hours", "أوقات العمل") },
              ],
            },
            {
              name: "coords",
              type: "group",
              label: t3("Coordonnées GPS (carte)", "GPS coordinates (map)", "الإحداثيات (الخريطة)"),
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "lat", type: "number", required: true, min: -90, max: 90, label: "Latitude" },
                    { name: "lng", type: "number", required: true, min: -180, max: 180, label: "Longitude" },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: t3("Réseaux sociaux", "Social", "الشبكات الاجتماعية"),
          fields: [
            {
              name: "socials",
              type: "group",
              label: false,
              fields: [
                { name: "facebook", type: "text", validate: httpsUrl, label: "Facebook" },
                { name: "instagram", type: "text", validate: httpsUrl, label: "Instagram" },
                { name: "linkedin", type: "text", validate: httpsUrl, label: "LinkedIn" },
              ],
            },
          ],
        },
        {
          label: t3("Chiffres clés", "Key figures", "أرقام رئيسية"),
          fields: [
            {
              name: "stats",
              type: "array",
              maxRows: 6,
              label: t3("Chiffres (bandeau d'accueil)", "Figures (home stats band)", "الأرقام (شريط الرئيسية)"),
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "value", type: "text", required: true, label: t3("Valeur", "Value", "القيمة"), admin: { width: "30%" } },
                    { name: "label", type: "text", localized: true, required: true, label: t3("Libellé", "Label", "التسمية"), admin: { width: "70%" } },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
