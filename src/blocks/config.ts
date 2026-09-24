import type { Block, Field } from "payload";
import { linkFields } from "../cms/fields";
import { t3 } from "../cms/labels";
import { featureIconOptions } from "../cms/options";

/**
 * Page-builder blocks for the Pages collection (devplan §4.3). All editor text
 * is localized; structure (which blocks, in what order) is shared by all locales.
 * Frontend renderers will live next to this file (src/blocks/*).
 */

const titleField: Field = {
  name: "title",
  type: "text",
  localized: true,
  label: t3("Titre", "Title", "العنوان"),
};

const subtitleField: Field = {
  name: "subtitle",
  type: "textarea",
  localized: true,
  label: t3("Sous-titre", "Subtitle", "العنوان الفرعي"),
};

export const HeroBlock: Block = {
  slug: "hero",
  interfaceName: "HeroBlock",
  labels: { singular: t3("Bannière", "Hero", "البانر"), plural: t3("Bannières", "Heroes", "البانرات") },
  fields: [
    {
      name: "style",
      type: "select",
      required: true,
      defaultValue: "compact",
      label: t3("Style", "Style", "النمط"),
      options: [
        { value: "full", label: t3("Grande bannière (accueil)", "Large banner (home)", "بانر كبير (الرئيسية)") },
        { value: "compact", label: t3("En-tête de page", "Page header", "رأس الصفحة") },
      ],
    },
    {
      name: "badge",
      type: "text",
      localized: true,
      label: t3("Badge", "Badge", "الشارة"),
    },
    { ...titleField, required: true },
    subtitleField,
    {
      type: "row",
      fields: [
        {
          name: "primaryCta",
          type: "group",
          label: t3("Bouton principal", "Primary button", "الزر الرئيسي"),
          admin: { width: "50%" },
          fields: linkFields({ required: false }),
        },
        {
          name: "secondaryCta",
          type: "group",
          label: t3("Bouton secondaire", "Secondary button", "الزر الثانوي"),
          admin: { width: "50%" },
          fields: linkFields({ required: false }),
        },
      ],
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: t3("Image", "Image", "الصورة"),
    },
  ],
};

export const StatsBlock: Block = {
  slug: "stats",
  interfaceName: "StatsBlock",
  labels: { singular: t3("Chiffres clés", "Stats", "أرقام"), plural: t3("Chiffres clés", "Stats", "أرقام") },
  fields: [
    titleField,
    {
      name: "useSiteStats",
      type: "checkbox",
      defaultValue: true,
      label: t3(
        "Utiliser les chiffres des Paramètres du site",
        "Use the figures from Site settings",
        "استعمال أرقام إعدادات الموقع",
      ),
    },
    {
      name: "items",
      type: "array",
      maxRows: 6,
      label: t3("Chiffres", "Figures", "الأرقام"),
      admin: { condition: (_, siblingData) => !siblingData?.useSiteStats },
      fields: [
        { name: "value", type: "text", required: true, label: t3("Valeur", "Value", "القيمة") },
        { name: "label", type: "text", localized: true, required: true, label: t3("Libellé", "Label", "التسمية") },
      ],
    },
  ],
};

export const ActivityGridBlock: Block = {
  slug: "activityGrid",
  interfaceName: "ActivityGridBlock",
  labels: {
    singular: t3("Grille des activités", "Activity grid", "شبكة الأنشطة"),
    plural: t3("Grilles des activités", "Activity grids", "شبكات الأنشطة"),
  },
  // Only the heading is editable here; the cards are rendered from the Services collection.
  fields: [titleField, subtitleField],
};

export const FeaturesBlock: Block = {
  slug: "features",
  interfaceName: "FeaturesBlock",
  labels: { singular: t3("Atouts", "Features", "المزايا"), plural: t3("Atouts", "Features", "المزايا") },
  fields: [
    titleField,
    subtitleField,
    {
      name: "items",
      type: "array",
      minRows: 1,
      maxRows: 8,
      label: t3("Éléments", "Items", "العناصر"),
      fields: [
        {
          name: "icon",
          type: "select",
          defaultValue: "Sun",
          options: featureIconOptions,
          label: t3("Icône", "Icon", "الأيقونة"),
        },
        { name: "title", type: "text", localized: true, required: true, label: t3("Titre", "Title", "العنوان") },
        {
          name: "description",
          type: "textarea",
          localized: true,
          label: t3("Description", "Description", "الوصف"),
        },
      ],
    },
  ],
};

export const ProjectsBlock: Block = {
  slug: "projects",
  interfaceName: "ProjectsBlock",
  labels: {
    singular: t3("Réalisations à la une", "Featured projects", "إنجازات مميّزة"),
    plural: t3("Réalisations à la une", "Featured projects", "إنجازات مميّزة"),
  },
  fields: [
    titleField,
    subtitleField,
    {
      name: "limit",
      type: "number",
      min: 1,
      max: 12,
      defaultValue: 3,
      label: t3("Nombre de réalisations", "Number of projects", "عدد الإنجازات"),
      admin: {
        description: t3(
          "Affiche les réalisations « mises en avant », les plus récentes d'abord.",
          "Shows “featured” projects, most recent first.",
          "يعرض الإنجازات «المميّزة»، الأحدث أولاً.",
        ),
      },
    },
  ],
};

export const CtaBlock: Block = {
  slug: "cta",
  interfaceName: "CtaBlock",
  labels: { singular: t3("Appel à l'action", "Call to action", "دعوة للعمل"), plural: t3("Appels à l'action", "Calls to action", "دعوات للعمل") },
  fields: [
    { ...titleField, required: true },
    subtitleField,
    {
      name: "button",
      type: "group",
      label: t3("Bouton", "Button", "الزر"),
      fields: linkFields({ required: false }),
    },
  ],
};

export const RichTextBlock: Block = {
  slug: "richText",
  interfaceName: "RichTextBlock",
  labels: { singular: t3("Texte", "Rich text", "نص"), plural: t3("Textes", "Rich text", "نصوص") },
  fields: [
    titleField,
    {
      name: "content",
      type: "richText",
      localized: true,
      required: true,
      label: t3("Contenu", "Content", "المحتوى"),
    },
  ],
};

export const LogosBlock: Block = {
  slug: "logos",
  interfaceName: "LogosBlock",
  labels: { singular: t3("Logos partenaires", "Partner logos", "شعارات الشركاء"), plural: t3("Logos partenaires", "Partner logos", "شعارات الشركاء") },
  fields: [
    titleField,
    {
      name: "logos",
      type: "array",
      minRows: 1,
      label: t3("Logos", "Logos", "الشعارات"),
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true, label: t3("Logo", "Logo", "الشعار") },
        { name: "name", type: "text", required: true, label: t3("Nom", "Name", "الاسم") },
        {
          name: "url",
          type: "text",
          label: t3("Site web", "Website", "الموقع"),
          validate: (value: string | null | undefined) =>
            !value || /^https:\/\/[^\s]+$/.test(value) || "Use an https:// URL.",
        },
      ],
    },
  ],
};

export const FaqBlock: Block = {
  slug: "faq",
  interfaceName: "FaqBlock",
  labels: { singular: t3("FAQ", "FAQ", "أسئلة شائعة"), plural: t3("FAQ", "FAQ", "أسئلة شائعة") },
  fields: [
    titleField,
    {
      name: "items",
      type: "relationship",
      relationTo: "faq",
      hasMany: true,
      label: t3("Questions", "Questions", "الأسئلة"),
      admin: {
        description: t3(
          "Vide = toutes les questions.",
          "Empty = all questions.",
          "فارغ = كل الأسئلة.",
        ),
      },
    },
  ],
};

export const pageBlocks: Block[] = [
  HeroBlock,
  StatsBlock,
  ActivityGridBlock,
  FeaturesBlock,
  ProjectsBlock,
  CtaBlock,
  RichTextBlock,
  LogosBlock,
  FaqBlock,
];
