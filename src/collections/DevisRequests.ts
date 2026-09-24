import { randomBytes } from "crypto";
import type { CollectionConfig, Field } from "payload";
import { admins, authenticated } from "../cms/access";
import { groups, t3 } from "../cms/labels";
import {
  activityOptions,
  contactChannelOptions,
  devisStatusOptions,
  governorateOptions,
} from "../cms/options";
import { locales } from "../i18n/config";

/** Tunisian mobile/landline: 8 digits starting 2–9, optional +216 / 00216 prefix. */
export const TN_PHONE_PATTERN = /^(?:\+216|00216)?[2-9]\d{7}$/;

export function normalizeTnPhone(value: string): string {
  return value.replace(/[\s.-]/g, "");
}

/** Human-friendly lead reference, e.g. GT-260924-7K2Q. */
function generateReference(date = new Date()): string {
  const ymd = date.toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = randomBytes(3).toString("hex").slice(0, 4).toUpperCase();
  return `GT-${ymd}-${suffix}`;
}

const onlyFor =
  (...activities: string[]) =>
  (data: Record<string, unknown>) =>
    activities.includes(String(data?.activity));

/** Step 2 of the devis form — technical needs per activity (devplan §6). */
const technicalFields: Field[] = [
  {
    name: "raccorde",
    type: "group",
    label: t3("Installation raccordée", "Grid-connected", "تركيب مربوط بالشبكة"),
    admin: { condition: onlyFor("raccorde") },
    fields: [
      {
        type: "row",
        fields: [
          { name: "monthlyBillTnd", type: "number", min: 0, label: t3("Facture STEG mensuelle (TND)", "Monthly STEG bill (TND)", "فاتورة الستاغ الشهرية (د.ت)") },
          { name: "monthlyConsumptionKwh", type: "number", min: 0, label: t3("Consommation mensuelle (kWh)", "Monthly consumption (kWh)", "الاستهلاك الشهري (كيلوواط ساعة)") },
        ],
      },
      {
        type: "row",
        fields: [
          {
            name: "roofType",
            type: "select",
            label: t3("Type de toiture", "Roof type", "نوع السطح"),
            options: [
              { value: "terrasse", label: t3("Terrasse béton", "Concrete flat roof", "سطح خرساني") },
              { value: "tuiles", label: t3("Tuiles", "Tiles", "قرميد") },
              { value: "bac-acier", label: t3("Bac acier", "Steel sheet", "صفائح فولاذية") },
              { value: "sol", label: t3("Au sol", "Ground-mounted", "على الأرض") },
            ],
          },
          { name: "roofSurfaceM2", type: "number", min: 0, label: t3("Surface disponible (m²)", "Available area (m²)", "المساحة المتاحة (م²)") },
          {
            name: "phase",
            type: "select",
            label: t3("Raccordement", "Supply", "نوع الربط"),
            options: [
              { value: "mono", label: t3("Monophasé", "Single-phase", "أحادي الطور") },
              { value: "tri", label: t3("Triphasé", "Three-phase", "ثلاثي الطور") },
            ],
          },
        ],
      },
      {
        name: "propertyType",
        type: "select",
        label: t3("Type de bâtiment", "Property type", "نوع المبنى"),
        options: [
          { value: "residentiel", label: t3("Résidentiel", "Residential", "سكني") },
          { value: "commercial", label: t3("Commercial", "Commercial", "تجاري") },
          { value: "industriel", label: t3("Industriel", "Industrial", "صناعي") },
          { value: "agricole", label: t3("Agricole", "Agricultural", "فلاحي") },
        ],
      },
    ],
  },
  {
    name: "pompage",
    type: "group",
    label: t3("Pompage solaire", "Solar pumping", "الضخّ الشمسي"),
    admin: { condition: onlyFor("pompage") },
    fields: [
      {
        type: "row",
        fields: [
          {
            name: "waterSource",
            type: "select",
            label: t3("Source d'eau", "Water source", "مصدر المياه"),
            options: [
              { value: "puits", label: t3("Puits", "Well", "بئر") },
              { value: "forage", label: t3("Forage", "Borehole", "حفر") },
              { value: "surface", label: t3("Surface (bassin, oued)", "Surface (basin, river)", "سطحي (حوض، وادي)") },
            ],
          },
          { name: "depthM", type: "number", min: 0, label: t3("Profondeur (m)", "Depth (m)", "العمق (م)") },
        ],
      },
      {
        type: "row",
        fields: [
          { name: "flowM3PerDay", type: "number", min: 0, label: t3("Débit (m³/jour)", "Flow (m³/day)", "التدفق (م³/يوم)") },
          { name: "headM", type: "number", min: 0, label: t3("HMT (m)", "Total head (m)", "الارتفاع المانومتري (م)") },
          { name: "existingPumpCv", type: "number", min: 0, label: t3("Pompe existante (CV)", "Existing pump (HP)", "المضخة الحالية (حصان)") },
        ],
      },
    ],
  },
  {
    name: "isole",
    type: "group",
    label: t3("Site isolé", "Off-grid", "موقع معزول"),
    admin: { condition: onlyFor("isole") },
    fields: [
      {
        type: "row",
        fields: [
          { name: "dailyConsumptionKwh", type: "number", min: 0, label: t3("Consommation (kWh/jour)", "Consumption (kWh/day)", "الاستهلاك (كيلوواط ساعة/يوم)") },
          { name: "autonomyDays", type: "number", min: 0, label: t3("Jours d'autonomie", "Days of autonomy", "أيام الاستقلالية") },
          { name: "hasGenset", type: "checkbox", label: t3("Groupe électrogène existant", "Existing genset", "مولّد موجود") },
        ],
      },
      { name: "criticalLoads", type: "textarea", label: t3("Charges critiques", "Critical loads", "الأحمال الحرجة") },
    ],
  },
  {
    name: "electrical",
    type: "group",
    label: t3("Travaux BT / MT", "LV / MV works", "أشغال الجهد المنخفض / المتوسط"),
    admin: { condition: onlyFor("bt", "mt") },
    fields: [
      { name: "workNature", type: "textarea", label: t3("Nature des travaux", "Nature of work", "طبيعة الأشغال") },
      {
        type: "row",
        fields: [
          {
            name: "siteType",
            type: "select",
            label: t3("Type de site", "Site type", "نوع الموقع"),
            options: [
              { value: "residentiel", label: t3("Résidentiel", "Residential", "سكني") },
              { value: "tertiaire", label: t3("Tertiaire", "Commercial", "خدمي") },
              { value: "industriel", label: t3("Industriel", "Industrial", "صناعي") },
              { value: "agricole", label: t3("Agricole", "Agricultural", "فلاحي") },
              { value: "public", label: t3("Public", "Public", "عمومي") },
            ],
          },
          { name: "indicativePowerKva", type: "number", min: 0, label: t3("Puissance indicative (kVA)", "Indicative power (kVA)", "القدرة التقديرية (ك.ف.أ)") },
        ],
      },
      { name: "existingInstallationNotes", type: "textarea", label: t3("Installation existante", "Existing installation", "التركيبة الحالية") },
    ],
  },
];

/**
 * Captured quote requests (devplan §6). Public visitors never write here via the
 * REST API — the Phase 5 server action validates with Zod and uses the Local API.
 */
export const DevisRequests: CollectionConfig = {
  slug: "devis-requests",
  labels: {
    singular: t3("Demande de devis", "Quote request", "طلب تسعيرة"),
    plural: t3("Demandes de devis", "Quote requests", "طلبات التسعيرة"),
  },
  admin: {
    useAsTitle: "reference",
    defaultColumns: ["reference", "createdAt", "activity", "region", "fullName", "status"],
    listSearchableFields: ["reference", "fullName", "phone", "email"],
    group: groups.leads,
  },
  defaultSort: "-createdAt",
  access: {
    // Team members can log phone/walk-in leads by hand from the admin.
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: admins,
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === "create" && !data.reference) data.reference = generateReference();
        if (typeof data.phone === "string") data.phone = normalizeTnPhone(data.phone);
        return data;
      },
    ],
  },
  fields: [
    // --- Sidebar: workflow ---
    {
      name: "reference",
      type: "text",
      unique: true,
      index: true,
      label: t3("Référence", "Reference", "المرجع"),
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "nouveau",
      options: devisStatusOptions,
      index: true,
      label: t3("Statut", "Status", "الحالة"),
      admin: { position: "sidebar" },
    },
    {
      name: "locale",
      type: "select",
      defaultValue: "fr",
      options: locales.map((l) => ({ value: l, label: l.toUpperCase() })),
      label: t3("Langue du client", "Client language", "لغة العميل"),
      admin: { position: "sidebar", readOnly: true },
    },
    {
      name: "notes",
      type: "textarea",
      label: t3("Notes internes", "Internal notes", "ملاحظات داخلية"),
      admin: {
        position: "sidebar",
        description: t3("Jamais visibles par le client.", "Never shown to the client.", "لا تظهر للعميل أبداً."),
      },
    },

    // --- Step 1: activity ---
    {
      name: "activity",
      type: "select",
      required: true,
      options: activityOptions,
      index: true,
      label: t3("Activité", "Activity", "النشاط"),
    },

    // --- Step 2: technical needs ---
    {
      type: "collapsible",
      label: t3("Besoins techniques", "Technical needs", "الحاجيات الفنية"),
      fields: technicalFields,
    },

    // --- Step 3: site & contact ---
    {
      type: "collapsible",
      label: t3("Site & contact", "Site & contact", "الموقع والاتصال"),
      fields: [
        {
          type: "row",
          fields: [
            { name: "fullName", type: "text", required: true, maxLength: 120, label: t3("Nom complet", "Full name", "الاسم الكامل") },
            {
              name: "phone",
              type: "text",
              required: true,
              label: t3("Téléphone", "Phone", "الهاتف"),
              validate: (value: string | null | undefined) =>
                (typeof value === "string" && TN_PHONE_PATTERN.test(normalizeTnPhone(value))) ||
                "Numéro tunisien invalide (8 chiffres, ex. 98 123 456 ou +216 98 123 456).",
            },
            { name: "email", type: "email", label: t3("E-mail", "Email", "البريد الإلكتروني") },
          ],
        },
        {
          type: "row",
          fields: [
            {
              name: "region",
              type: "select",
              required: true,
              options: governorateOptions,
              index: true,
              label: t3("Gouvernorat", "Governorate", "الولاية"),
            },
            {
              name: "preferredChannel",
              type: "select",
              defaultValue: "call",
              options: contactChannelOptions,
              label: t3("Canal préféré", "Preferred channel", "وسيلة الاتصال المفضّلة"),
            },
          ],
        },
        { name: "address", type: "textarea", maxLength: 500, label: t3("Adresse", "Address", "العنوان") },
      ],
    },

    // --- Step 4: consent ---
    {
      name: "consent",
      type: "checkbox",
      required: true,
      label: t3(
        "Consentement au traitement des données",
        "Consent to data processing",
        "الموافقة على معالجة البيانات",
      ),
      validate: (value: boolean | null | undefined) =>
        value === true || "Le consentement est obligatoire.",
    },
  ],
};
