import type { Access, CollectionConfig } from "payload";
import { admins, ownSites, siteContentAccess } from "../cms/access";
import { siteField } from "../cms/fields";
import { groups, t3 } from "../cms/labels";
import { revalidateCollection } from "../cms/revalidate";
import { documentTypes, documentVisibilities, expiryLevels, startOfTunisDay } from "../lib/documents";
import { companyDocumentsDir } from "../lib/devis/quote-files";

/**
 * Visitors may download a document (file and data) only while it is public
 * and not expired; the team sees every document of the sites it manages.
 * "On request" documents are listed on /documents by the server, without
 * their file.
 */
const readAccess: Access = (args) => {
  if (args.req.user) return ownSites(args);
  return {
    and: [
      { visibility: { equals: "public" } },
      { or: [{ validUntil: { exists: false } }, { validUntil: { greater_than_equal: startOfTunisDay().toISOString() } }] },
    ],
  };
};

/**
 * Tender documents (plan Phase 6): attestations (tax, CNSS), RNE extract,
 * certificates, completion certificates, datasheets. Each company's public
 * ones are listed on its /documents page; the team is alerted before they
 * expire (src/jobs/document-expiry.ts) and sees them on the dashboard.
 */
export const CompanyDocuments: CollectionConfig = {
  slug: "company-documents",
  labels: {
    singular: t3("Document administratif", "Company document", "وثيقة إدارية"),
    plural: t3("Documents administratifs", "Company documents", "الوثائق الإدارية"),
  },
  admin: {
    group: groups.tenders,
    useAsTitle: "title",
    defaultColumns: ["title", "type", "site", "validUntil", "visibility"],
    description: t3(
      "Attestations et certificats pour les appels d'offres. Les documents publics et valides sont téléchargeables sur la page /documents du site ; l'équipe est prévenue 30 jours puis 7 jours avant l'expiration.",
      "Certificates for tenders. Public, valid documents can be downloaded from the site's /documents page; the team is alerted 30 then 7 days before they expire.",
      "شهادات لطلبات العروض. الوثائق العمومية السارية قابلة للتحميل من صفحة ‎/documents؛ يُنبَّه الفريق قبل انتهاء صلاحيتها بـ30 ثم 7 أيام.",
    ),
  },
  access: {
    read: readAccess,
    create: siteContentAccess().create,
    update: ownSites,
    delete: admins,
  },
  upload: {
    staticDir: companyDocumentsDir,
    mimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  },
  defaultSort: "type",
  hooks: {
    ...revalidateCollection("company-documents"),
    beforeChange: [
      // A new validity date (a renewed attestation) starts its alerts over.
      ({ data, originalDoc }) => {
        if (originalDoc && data.validUntil !== undefined && data.validUntil !== originalDoc.validUntil) {
          data.alertLevel = null;
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "title",
      type: "text",
      localized: true,
      required: true,
      label: t3("Titre", "Title", "العنوان"),
      admin: {
        description: t3(
          "Tel qu'affiché aux acheteurs, ex. « Attestation de situation fiscale 2026 ».",
          "As shown to buyers, e.g. “Tax clearance certificate 2026”.",
          "كما يظهر للمشترين، مثلاً « شهادة في الوضعية الجبائية 2026 ».",
        ),
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "type",
          type: "select",
          required: true,
          index: true,
          options: documentTypes.map((t) => ({ value: t.value, label: t.label })),
          label: t3("Type", "Type", "النوع"),
          admin: { width: "50%" },
        },
        {
          name: "validUntil",
          type: "date",
          index: true,
          label: t3("Valide jusqu'au", "Valid until", "صالحة إلى غاية"),
          admin: {
            width: "50%",
            date: { pickerAppearance: "dayOnly", displayFormat: "dd/MM/yyyy" },
            description: t3(
              "Vide = sans date d'expiration (fiche technique, certificat permanent).",
              "Empty = never expires (datasheet, permanent certificate).",
              "فارغ = دون تاريخ انتهاء (بطاقة فنية، شهادة دائمة).",
            ),
            components: { Cell: "/components/admin/validity-cell#ValidityCell" },
          },
        },
      ],
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      label: t3("Précision", "Details", "توضيح"),
      admin: {
        description: t3(
          "Optionnel, ex. l'organisme qui l'a délivré.",
          "Optional, e.g. the issuing body.",
          "اختياري، مثلاً الجهة المُصدِرة.",
        ),
      },
    },
    siteField(),
    {
      name: "visibility",
      type: "select",
      required: true,
      defaultValue: "public",
      options: documentVisibilities.map((v) => ({ value: v.value, label: v.label })),
      label: t3("Visibilité", "Visibility", "الظهور"),
      admin: {
        position: "sidebar",
        description: t3(
          "Un document expiré n'est plus proposé au public, quelle que soit sa visibilité.",
          "An expired document is no longer offered to the public, whatever its visibility.",
          "لا تُعرض الوثيقة المنتهية الصلاحية على العموم مهما كان ظهورها.",
        ),
      },
    },
    {
      // The last expiry alert sent (src/jobs/document-expiry.ts); reset when the date changes.
      name: "alertLevel",
      type: "select",
      options: expiryLevels.map((l) => ({ value: l, label: l })),
      admin: { hidden: true },
    },
  ],
};
