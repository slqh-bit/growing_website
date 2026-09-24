import type { CollectionConfig } from "payload";
import { admins, anyone, authenticated } from "../cms/access";
import { seoField, slugField } from "../cms/fields";
import { groups, t3 } from "../cms/labels";
import { revalidateCollection } from "../cms/revalidate";
import { activityOptions, serviceIconOptions } from "../cms/options";

/** The five activities (devplan §4.1). */
export const Services: CollectionConfig = {
  slug: "services",
  labels: {
    singular: t3("Service", "Service", "خدمة"),
    plural: t3("Services", "Services", "الخدمات"),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "activityKey", "order", "updatedAt"],
    group: groups.content,
  },
  defaultSort: "order",
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: admins,
  },
  hooks: revalidateCollection("services"),
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
          name: "activityKey",
          type: "select",
          required: true,
          unique: true,
          options: [...activityOptions],
          label: t3("Activité", "Activity", "النشاط"),
          admin: {
            width: "50%",
            description: t3(
              "Relie le service au formulaire de devis.",
              "Links the service to the quote form.",
              "يربط الخدمة باستمارة التسعيرة.",
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
