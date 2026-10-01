import type { Block, Field } from "payload";
import { linkFields } from "../cms/fields";
import { t3 } from "../cms/labels";

/**
 * Page blocks of the group site's home (plan §3.3, group landing): they show
 * the group's companies, their services and projects — read live from each
 * company's site — plus editable texts. They work on any site.
 */

const eyebrowField: Field = {
  name: "eyebrow",
  type: "text",
  localized: true,
  label: t3("Surtitre", "Eyebrow", "العنوان التمهيدي"),
  admin: {
    description: t3(
      "Petit texte au-dessus du titre.",
      "Small text above the title.",
      "نص صغير فوق العنوان.",
    ),
  },
};
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
/** The title, with a note on what the block shows (blocks have no description of their own). */
const titleWithNote = (fr: string, en: string, ar: string, extra: Partial<Field> = {}): Field =>
  ({
    ...titleField,
    ...extra,
    admin: {
      ...(extra as { admin?: object }).admin,
      description: t3(
        `${fr} Les sociétés viennent de Paramètres → Groupe (sinon tous les sites).`,
        `${en} The companies come from Settings → Group (else every site).`,
        `${ar} تأتي الشركات من الإعدادات ← المجموعة.`,
      ),
    },
  }) as Field;

export const GroupHeroBlock: Block = {
  slug: "groupHero",
  interfaceName: "GroupHeroBlock",
  labels: {
    singular: t3("Bannière du groupe", "Group hero", "بانر المجموعة"),
    plural: t3("Bannières du groupe", "Group heroes", "بانرات المجموعة"),
  },
  fields: [
    { name: "badge", type: "text", localized: true, label: t3("Badge", "Badge", "الشارة") },
    {
      type: "row",
      fields: [
        titleWithNote(
          "Grande bannière sombre avec une carte par société.",
          "Large dark banner with one card per company.",
          "بانر داكن كبير مع بطاقة لكل شركة.",
          { required: true, admin: { width: "50%" } } as Partial<Field>,
        ),
        {
          name: "highlight",
          type: "text",
          localized: true,
          label: t3(
            "Suite du titre (en dégradé)",
            "Title end (gradient)",
            "تتمة العنوان (متدرّجة)",
          ),
          admin: { width: "50%" },
        },
      ],
    },
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
  ],
};

export const CompaniesBlock: Block = {
  slug: "companies",
  interfaceName: "CompaniesBlock",
  labels: {
    singular: t3("Sociétés du groupe", "Group companies", "شركات المجموعة"),
    plural: t3("Sociétés du groupe", "Group companies", "شركات المجموعة"),
  },
  fields: [
    eyebrowField,
    titleWithNote(
      "Une grande carte par société, à ses couleurs, avec ses activités.",
      "One large card per company, in its colours, with its activities.",
      "بطاقة كبيرة لكل شركة بألوانها مع أنشطتها.",
    ),
    subtitleField,
    {
      name: "linkLabel",
      type: "text",
      localized: true,
      label: t3("Texte du lien", "Link text", "نص الرابط"),
      admin: {
        description: t3(
          "Ex. « Découvrir le site ».",
          "E.g. “Visit the site”.",
          "مثال: « زيارة الموقع ».",
        ),
      },
    },
  ],
};

export const GroupServicesBlock: Block = {
  slug: "groupServices",
  interfaceName: "GroupServicesBlock",
  labels: {
    singular: t3("Services par société", "Services by company", "الخدمات حسب الشركة"),
    plural: t3("Services par société", "Services by company", "الخدمات حسب الشركة"),
  },
  fields: [
    eyebrowField,
    titleWithNote(
      "Un onglet par société listant ses activités (Services), chacune menant à sa page.",
      "One tab per company listing its activities (Services), each linking to its page.",
      "تبويب لكل شركة يعرض أنشطتها.",
    ),
    subtitleField,
  ],
};

export const StepsBlock: Block = {
  slug: "steps",
  interfaceName: "StepsBlock",
  labels: { singular: t3("Étapes", "Steps", "المراحل"), plural: t3("Étapes", "Steps", "المراحل") },
  fields: [
    eyebrowField,
    titleField,
    {
      name: "items",
      type: "array",
      minRows: 2,
      maxRows: 6,
      label: t3("Étapes", "Steps", "المراحل"),
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
  ],
};

export const GroupProjectsBlock: Block = {
  slug: "groupProjects",
  interfaceName: "GroupProjectsBlock",
  labels: {
    singular: t3("Réalisations du groupe", "Group projects", "إنجازات المجموعة"),
    plural: t3("Réalisations du groupe", "Group projects", "إنجازات المجموعة"),
  },
  fields: [
    eyebrowField,
    titleWithNote(
      "Les réalisations « mises en avant » de chaque société, avec son nom. Masqué s'il n'y en a aucune.",
      "Each company's “featured” projects, labelled with its name. Hidden when there are none.",
      "الإنجازات المميّزة لكل شركة. يُخفى إن لم توجد.",
    ),
    subtitleField,
    {
      name: "limit",
      type: "number",
      min: 1,
      max: 12,
      defaultValue: 6,
      label: t3("Nombre maximum", "Maximum number", "العدد الأقصى"),
    },
  ],
};

export const QuoteFormBlock: Block = {
  slug: "quoteForm",
  interfaceName: "QuoteFormBlock",
  labels: {
    singular: t3("Formulaire de devis", "Quote form", "استمارة التسعيرة"),
    plural: t3("Formulaires de devis", "Quote forms", "استمارات التسعيرة"),
  },
  fields: [
    eyebrowField,
    {
      ...titleField,
      admin: {
        description: t3(
          "Le formulaire de devis complet. Sur le site du groupe, le client choisit d'abord la société : la demande est envoyée à son équipe.",
          "The full quote form. On the group site the client first picks the company: the request goes to its team.",
          "استمارة التسعيرة كاملة. في موقع المجموعة يختار الحريف الشركة أولاً.",
        ),
      },
    } as Field,
    subtitleField,
  ],
};

export const groupBlocks: Block[] = [
  GroupHeroBlock,
  CompaniesBlock,
  GroupServicesBlock,
  StepsBlock,
  GroupProjectsBlock,
  QuoteFormBlock,
];
