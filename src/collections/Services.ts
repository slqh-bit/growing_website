import type { CollectionConfig } from "payload";
import { siteContentAccess } from "../cms/access";
import { seoField, siteField, slugField, uniqueSlugPerSite } from "../cms/fields";
import { groups, t3 } from "../cms/labels";
import { revalidateCollection } from "../cms/revalidate";
import { activityOptions, serviceIconOptions } from "../cms/options";

/**
 * Activities / service pages of each site (plan §4): Growing's 4 activities,
 * Hikview's areas (sub-pages in Phase 3). `sections` become in-page anchors
 * (/services/installation-raccordee#commercial).
 */
export const Services: CollectionConfig = {
  slug: "services",
  labels: {
    singular: t3("Service", "Service", "خدمة"),
    plural: t3("Services", "Services", "الخدمات"),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "site", "activityKey", "order", "updatedAt"],
    group: groups.content,
  },
  defaultSort: "order",
  access: siteContentAccess(),
  indexes: [...uniqueSlugPerSite, { fields: ["site", "activityKey"], unique: true }],
  hooks: revalidateCollection("services"),
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
          name: "activityKey",
          type: "select",
          options: [...activityOptions],
          label: t3("Activité", "Activity", "النشاط"),
          admin: {
            width: "50%",
            description: t3(
              "Relie le service au formulaire de devis. Vide = le bouton « Devis » mène à la page Contact.",
              "Links the service to the quote form. Empty = the quote button leads to the Contact page.",
              "يربط الخدمة باستمارة التسعيرة. فارغ = يؤدي زر التسعيرة إلى صفحة الاتصال.",
            ),
          },
        },
        {
          name: "icon",
          type: "select",
          required: true,
          defaultValue: "Sun",
          options: serviceIconOptions,
          label: t3("Icône", "Icon", "الأيقونة"),
          admin: { width: "25%" },
        },
        {
          name: "order",
          type: "number",
          required: true,
          defaultValue: 0,
          label: t3("Ordre", "Order", "الترتيب"),
          admin: { width: "25%" },
        },
      ],
    },
    {
      name: "shortDescription",
      type: "textarea",
      localized: true,
      required: true,
      maxLength: 240,
      label: t3("Description courte", "Short description", "وصف قصير"),
      admin: {
        description: t3(
          "Affichée sur les cartes (≈ 1 phrase).",
          "Shown on cards (≈ 1 sentence).",
          "تظهر على البطاقات (جملة واحدة تقريباً).",
        ),
      },
    },
    {
      name: "body",
      type: "richText",
      localized: true,
      label: t3("Contenu", "Body", "المحتوى"),
    },
    {
      // Shared rows (same anchors in every language), translated text.
      name: "sections",
      type: "array",
      label: t3("Sections de la page", "Page sections", "أقسام الصفحة"),
      labels: {
        singular: t3("Section", "Section", "قسم"),
        plural: t3("Sections", "Sections", "الأقسام"),
      },
      admin: {
        description: t3(
          "Parties de la page avec leur propre ancre, ex. #commercial → /fr/services/installation-raccordee#commercial.",
          "Parts of the page with their own anchor, e.g. #commercial → /fr/services/installation-raccordee#commercial.",
          "أجزاء من الصفحة لكلّ منها مرساة، مثل ‎#commercial.",
        ),
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "anchor",
              type: "text",
              required: true,
              label: t3("Ancre", "Anchor", "المرساة"),
              validate: (value: string | null | undefined) =>
                (typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) ||
                "Lowercase letters, digits and hyphens only (e.g. commercial).",
              admin: { width: "50%" },
            },
            {
              name: "icon",
              type: "select",
              options: serviceIconOptions,
              label: t3("Icône", "Icon", "الأيقونة"),
              admin: { width: "50%" },
            },
          ],
        },
        {
          name: "title",
          type: "text",
          localized: true,
          required: true,
          label: t3("Titre", "Title", "العنوان"),
        },
        {
          name: "body",
          type: "richText",
          localized: true,
          label: t3("Contenu", "Body", "المحتوى"),
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: t3("Image", "Image", "صورة"),
        },
      ],
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      label: t3("Image principale", "Hero image", "الصورة الرئيسية"),
    },
    {
      // Localized array: each language keeps its own list of benefits.
      name: "benefits",
      type: "array",
      localized: true,
      label: t3("Bénéfices", "Benefits", "الفوائد"),
      labels: {
        singular: t3("Bénéfice", "Benefit", "فائدة"),
        plural: t3("Bénéfices", "Benefits", "الفوائد"),
      },
      fields: [
        {
          name: "text",
          type: "text",
          required: true,
          label: t3("Texte", "Text", "النص"),
        },
      ],
    },
    {
      // Shared steps with translated text, so the process stays aligned across languages.
      name: "process",
      type: "array",
      label: t3("Démarche", "Process", "المنهجية"),
      labels: {
        singular: t3("Étape", "Step", "خطوة"),
        plural: t3("Étapes", "Steps", "الخطوات"),
      },
      fields: [
        {
          name: "title",
          type: "text",
          localized: true,
          required: true,
          label: t3("Titre", "Title", "العنوان"),
        },
        {
          name: "description",
          type: "textarea",
          localized: true,
          label: t3("Description", "Description", "الوصف"),
        },
      ],
    },
    {
      name: "faqRefs",
      type: "relationship",
      relationTo: "faq",
      hasMany: true,
      label: t3("Questions fréquentes liées", "Related FAQ", "أسئلة شائعة مرتبطة"),
    },
    seoField,
  ],
};
