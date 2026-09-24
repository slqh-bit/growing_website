import type { GlobalConfig } from "payload";
import { admins, anyone } from "../cms/access";
import { groups, t3 } from "../cms/labels";
import { revalidateGlobal } from "../cms/revalidate";

const httpsUrl = (value: string | null | undefined) =>
  !value || /^https:\/\/[^\s]+$/.test(value) || "Use an https:// URL.";

/** Company-wide settings (devplan §4.8): contacts, legal ids, map, socials, stats. */
export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: t3("Paramètres du site", "Site settings", "إعدادات الموقع"),
  admin: { group: groups.settings },
  access: {
    read: anyone,
    // Legal identifiers and contact details: admins only.
    update: admins,
  },
  hooks: { afterChange: revalidateGlobal("site-settings") },
  fields: [
    {
      type: "tabs",
      tabs: [
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
                { name: "certification", type: "text", defaultValue: "ANME", label: t3("Certification", "Certification", "الاعتماد") },
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
