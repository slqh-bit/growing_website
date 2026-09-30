import { after } from "next/server";
import type { CollectionAfterChangeHook, CollectionConfig, Field } from "payload";
import { admins, authenticated, ownSites } from "../cms/access";
import { siteField } from "../cms/fields";
import { groups, t3 } from "../cms/labels";
import { devisStatusOptions } from "../cms/options";
import {
  activityOptions,
  contactChannelOptions,
  governorateOptions,
  phaseOptions,
  propertyTypeOptions,
  roofTypeOptions,
  siteTypeOptions,
  waterSourceOptions,
} from "../lib/devis/options";
import { isValidTnPhone, normalizeTnPhone } from "../lib/devis/phone";
import { notifyStatusChange } from "../lib/devis/email";
import { generateReference, referencePrefix } from "../lib/devis/reference";
import { clientNotifiedStatuses, type DevisStatus } from "../lib/devis/tracking";
import { locales } from "../i18n/config";

/** Legacy typed groups: only for requests made with the pre-Phase-5a form. */
const onlyFor =
  (...activities: string[]) =>
  (data: Record<string, unknown>) =>
    !data?.formSnapshot && activities.includes(String(data?.activity));

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
            options: [...roofTypeOptions],
          },
          { name: "roofSurfaceM2", type: "number", min: 0, label: t3("Surface disponible (m²)", "Available area (m²)", "المساحة المتاحة (م²)") },
          {
            name: "phase",
            type: "select",
            label: t3("Raccordement", "Supply", "نوع الربط"),
            options: [...phaseOptions],
          },
        ],
      },
      {
        name: "propertyType",
        type: "select",
        label: t3("Type de bâtiment", "Property type", "نوع المبنى"),
        options: [...propertyTypeOptions],
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
            options: [...waterSourceOptions],
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
            options: [...siteTypeOptions],
          },
          { name: "indicativePowerKva", type: "number", min: 0, label: t3("Puissance indicative (kVA)", "Indicative power (kVA)", "القدرة التقديرية (ك.ف.أ)") },
        ],
      },
      { name: "existingInstallationNotes", type: "textarea", label: t3("Installation existante", "Existing installation", "التركيبة الحالية") },
    ],
  },
];

/**
 * Emails the client when their lead reaches a notified status. Scheduled with
 * `after` (once the admin save is committed and answered); outside a Next.js
 * request (Payload CLI scripts) it is sent right away instead.
 */
const emailClientOnStatusChange: CollectionAfterChangeHook = ({ doc, previousDoc, operation, req, context }) => {
  const status = doc.status as DevisStatus;
  if (operation !== "update" || context.skipStatusEmail) return doc;
  if (status === previousDoc?.status || !clientNotifiedStatuses.includes(status) || !doc.email) return doc;

  const send = async () => {
    try {
      await notifyStatusChange(req.payload, doc);
    } catch (err) {
      req.payload.logger.error({ err, msg: `Devis ${doc.reference}: status email failed` });
    }
  };
  try {
    after(send);
  } catch {
    void send(); // no Next.js request scope
  }
  return doc;
};

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
    defaultColumns: ["reference", "createdAt", "site", "service", "region", "fullName", "status"],
    listSearchableFields: ["reference", "fullName", "phone", "email"],
    group: groups.leads,
  },
  defaultSort: "-createdAt",
  access: {
    // Team members can log phone/walk-in leads by hand from the admin.
    create: authenticated,
    read: ownSites,
    update: ownSites,
    delete: admins,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        if (operation === "create" && !data.reference) {
          const siteId = typeof data.site === "object" ? data.site?.id : data.site;
          const site = siteId
            ? await req.payload.findByID({ collection: "sites", id: siteId, depth: 0, req }).catch(() => null)
            : null;
          data.reference = generateReference(referencePrefix(site?.monogram));
        }
        if (typeof data.phone === "string") data.phone = normalizeTnPhone(data.phone);

        // Date each status is reached, for the client tracking page (/suivi).
        const status = data.status ?? originalDoc?.status ?? "nouveau";
        const history = (originalDoc?.statusHistory ?? []) as { status: string; changedAt: string }[];
        if (operation === "create" || status !== originalDoc?.status) {
          data.statusHistory = [
            ...history.map(({ status, changedAt }) => ({ status, changedAt })),
            { status, changedAt: new Date().toISOString() },
          ];
        }
        return data;
      },
    ],
    afterChange: [emailClientOnStatusChange],
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
      admin: {
        position: "sidebar",
        description: t3(
          "Le client (s'il a donné un e-mail) est prévenu aux étapes « Devis envoyé » et « Gagné ».",
          "The client (if they gave an email) is notified at “Quote sent” and “Won”.",
          "يُعلَم العميل (إن ترك بريداً إلكترونياً) عند « أُرسلت التسعيرة » و« ناجح ».",
        ),
      },
    },
    {
      name: "quote",
      type: "upload",
      relationTo: "quote-documents",
      label: t3("Devis (PDF)", "Quote (PDF)", "التسعيرة (PDF)"),
      admin: {
        position: "sidebar",
        description: t3(
          "Obligatoire pour « Devis envoyé » : il est joint à l'e-mail du client. Sans e-mail client, envoyez-le par WhatsApp.",
          "Required for “Quote sent”: it is attached to the client's email. If the client gave no email, send it on WhatsApp.",
          "إلزامي لـ« أُرسلت التسعيرة »: يُرفق برسالة العميل. إن لم يترك العميل بريداً، أرسلها عبر واتساب.",
        ),
      },
      // The status email promises a quote: never let "devis-envoye" be saved without one.
      validate: (value: unknown, { siblingData }: { siblingData: Partial<{ status: string }> }) =>
        siblingData?.status !== "devis-envoye" ||
        Boolean(value) ||
        "Joignez le devis PDF avant de passer au statut « Devis envoyé ».",
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
    {
      name: "statusHistory",
      type: "array",
      label: t3("Historique du statut", "Status history", "سجلّ الحالة"),
      admin: {
        readOnly: true,
        initCollapsed: true,
        description: t3(
          "Rempli automatiquement ; les dates apparaissent sur la page de suivi du client.",
          "Filled automatically; the dates appear on the client's tracking page.",
          "يُملأ تلقائياً؛ تظهر التواريخ في صفحة المتابعة لدى العميل.",
        ),
      },
      fields: [
        {
          type: "row",
          fields: [
            { name: "status", type: "select", required: true, options: devisStatusOptions, label: t3("Statut", "Status", "الحالة") },
            {
              name: "changedAt",
              type: "date",
              required: true,
              label: t3("Date", "Date", "التاريخ"),
              admin: { date: { pickerAppearance: "dayAndTime" } },
            },
          ],
        },
      ],
    },

    siteField(),

    // --- Step 1: service ---
    {
      type: "row",
      fields: [
        {
          name: "service",
          type: "relationship",
          relationTo: "services",
          index: true,
          label: t3("Service", "Service", "الخدمة"),
          admin: { width: "60%" },
        },
        {
          // Legacy key (Growing's typed form); still set for services that have one.
          name: "activity",
          type: "select",
          options: [...activityOptions],
          index: true,
          label: t3("Activité (ancienne)", "Activity (legacy)", "النشاط (قديم)"),
          admin: { width: "40%", readOnly: true, condition: (data) => Boolean(data?.activity) },
        },
      ],
    },

    // --- Step 2: technical needs ---
    {
      type: "collapsible",
      label: t3("Besoins techniques", "Technical needs", "الحاجيات الفنية"),
      fields: [
        {
          // The answers, as a table in the admin's language (from the snapshot below).
          name: "answersView",
          type: "ui",
          admin: { components: { Field: "/components/admin/devis-answers#DevisAnswers" } },
        },
        {
          name: "technicalDetails",
          type: "json",
          label: t3("Réponses", "Answers", "الإجابات"),
          admin: { hidden: true },
        },
        {
          // The questions as they were when the client filled the form.
          name: "formSnapshot",
          type: "json",
          label: t3("Formulaire (copie)", "Form (snapshot)", "الاستمارة (نسخة)"),
          admin: { hidden: true },
        },
        {
          name: "attachments",
          type: "upload",
          relationTo: "devis-attachments",
          hasMany: true,
          label: t3("Pièces jointes du client", "Client attachments", "مرفقات العميل"),
          admin: {
            description: t3(
              "Plans, photos ou cahier des charges envoyés avec la demande.",
              "Plans, photos or specifications sent with the request.",
              "مخططات أو صور أو كرّاس شروط أُرسلت مع الطلب.",
            ),
          },
        },
        ...technicalFields,
      ],
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
                (typeof value === "string" && isValidTnPhone(value)) ||
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
              options: [...governorateOptions],
              index: true,
              label: t3("Gouvernorat", "Governorate", "الولاية"),
            },
            {
              name: "preferredChannel",
              type: "select",
              defaultValue: "call",
              options: [...contactChannelOptions],
              label: t3("Canal préféré", "Preferred channel", "وسيلة الاتصال المفضّلة"),
            },
          ],
        },
        { name: "address", type: "textarea", maxLength: 500, label: t3("Adresse", "Address", "العنوان") },
        {
          name: "siteVisit",
          type: "checkbox",
          defaultValue: false,
          label: t3("Visite technique sur site souhaitée", "On-site technical visit requested", "طلب زيارة تقنية للموقع"),
        },
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
