import type { CollectionConfig } from "payload";
import { siteContentAccess } from "../cms/access";
import { seoField, siteField, slugField, uniqueSlugPerSite } from "../cms/fields";
import { groups, t3 } from "../cms/labels";
import { revalidateCollection } from "../cms/revalidate";
import { clientTypeOptions } from "../cms/options";

/** Realized projects / case studies (devplan §4.2). */
export const Projects: CollectionConfig = {
  slug: "projects",
  labels: {
    singular: t3("Réalisation", "Project", "إنجاز"),
    plural: t3("Réalisations", "Projects", "الإنجازات"),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "site", "activity", "clientType", "featured", "date"],
    group: groups.content,
  },
  defaultSort: "-date",
  access: siteContentAccess(),
  indexes: uniqueSlugPerSite,
  hooks: revalidateCollection("projects"),
  fields: [
    {
      name: "title",
      type: "text",
      localized: true,
      required: true,
      label: t3("Titre", "Title", "العنوان"),
    },
    slugField("title", { unique: false }),
    siteField(),
    {
      type: "row",
      fields: [
        {
          name: "activity",
          type: "relationship",
          relationTo: "services",
          required: true,
          // Only the activities of the project's own site.
          filterOptions: ({ siblingData }) => {
            const site = (siblingData as { site?: unknown }).site;
            return site ? { site: { equals: typeof site === "object" ? (site as { id: unknown }).id : site } } : true;
          },
          label: t3("Activité", "Activity", "النشاط"),
          admin: { width: "50%" },
        },
        {
          name: "clientType",
          type: "select",
          required: true,
          options: clientTypeOptions,
          label: t3("Type de client", "Client type", "نوع العميل"),
          admin: { width: "50%" },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "client",
          type: "text",
          label: t3("Client", "Client", "العميل"),
          admin: {
            width: "70%",
            description: t3(
              "Ex. « Commune de Sbeitla ». Laissez vide pour un client anonyme.",
              "E.g. “Sbeitla municipality”. Leave empty for an anonymous client.",
              "مثال «بلدية سبيطلة». اتركه فارغاً لعميل مجهول.",
            ),
          },
        },
        {
          name: "clientNamePublic",
          type: "checkbox",
          defaultValue: true,
          label: t3("Nom du client public", "Client name is public", "اسم العميل علني"),
          admin: { width: "30%", style: { alignSelf: "center" } },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "region",
          type: "text",
          localized: true,
          required: true,
          label: t3("Région", "Region", "الجهة"),
          admin: { width: "50%" },
        },
        {
          name: "powerKwc",
          type: "number",
          min: 0,
          label: t3("Puissance (kWc)", "Power (kWp)", "القدرة (كيلوواط ذروة)"),
          admin: {
            width: "25%",
            description: t3("Vide pour BT/MT.", "Empty for LV/MV.", "فارغ للجهد المنخفض/المتوسط."),
          },
        },
        {
          name: "date",
          type: "date",
          required: true,
          label: t3("Date de réalisation", "Completion date", "تاريخ الإنجاز"),
          admin: { width: "25%", date: { pickerAppearance: "monthOnly" } },
        },
      ],
    },
    {
      name: "summary",
      type: "textarea",
      localized: true,
      required: true,
      maxLength: 280,
      label: t3("Résumé", "Summary", "الملخّص"),
    },
    {
      name: "body",
      type: "richText",
      localized: true,
      label: t3("Contenu", "Body", "المحتوى"),
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: t3("Image de couverture", "Cover image", "صورة الغلاف"),
    },
    {
      name: "gallery",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      label: t3("Galerie", "Gallery", "معرض الصور"),
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      label: t3("Mis en avant (accueil)", "Featured (home page)", "مميّز (الصفحة الرئيسية)"),
      admin: { position: "sidebar" },
    },
    seoField,
  ],
};
