import type { CollectionConfig } from "payload";
import { admins, anyone, authenticated } from "../cms/access";
import { seoField, slugField } from "../cms/fields";
import { groups, t3 } from "../cms/labels";
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
    defaultColumns: ["title", "activity", "clientType", "featured", "date"],
    group: groups.content,
  },
  defaultSort: "-date",
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: admins,
  },
  fields: [
    {
      name: "title",
      type: "text",
      localized: true,
      required: true,
      label: t3("Titre", "Title", "العنوان"),
    },
    slugField(),
    {
      type: "row",
      fields: [
        {
          name: "activity",
          type: "relationship",
          relationTo: "services",
          required: true,
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
