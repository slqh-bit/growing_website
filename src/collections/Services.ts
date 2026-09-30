import type { CollectionConfig, Validate, Where } from "payload";
import { siteContentAccess } from "../cms/access";
import { seoField, siteField, slugField, uniqueSlugPerSite } from "../cms/fields";
import { groups, t3 } from "../cms/labels";
import { revalidateCollection } from "../cms/revalidate";
import { activityOptions, serviceIconOptions } from "../cms/options";

const idOf = (v: unknown): number | null =>
  v === null || v === undefined ? null : typeof v === "object" ? ((v as { id?: number }).id ?? null) : Number(v);

/** Two levels only (area → sub-service), both on the same site. */
const validateParent: Validate = async (value, { req, id, siblingData }) => {
  const parent = idOf(value);
  if (parent === null) return true;
  if (id !== undefined && parent === Number(id)) return "A service can't be its own parent.";
  const doc = await req.payload.findByID({ collection: "services", id: parent, depth: 0, req }).catch(() => null);
  if (!doc) return "Unknown parent service.";
  if (idOf(doc.parent) !== null) return "Choose a top-level service (area): sub-services can't have sub-services.";
  if (idOf((siblingData as { site?: unknown }).site) !== idOf(doc.site)) return "The parent must belong to the same site.";
  if (id !== undefined) {
    const { totalDocs } = await req.payload.count({ collection: "services", where: { parent: { equals: id } }, req });
    if (totalDocs > 0) return "This service has sub-services: it can't become a sub-service itself.";
  }
  return true;
};

/**
 * Activities / service pages of each site (plan §4): Growing's 4 activities,
 * Hikview's 6 areas and their sub-services (`parent` → /services/<area>/<sub>).
 * `sections` become in-page anchors (/services/installation-raccordee#commercial).
 */
export const Services: CollectionConfig = {
  slug: "services",
  labels: {
    singular: t3("Service", "Service", "خدمة"),
    plural: t3("Services", "Services", "الخدمات"),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "site", "parent", "activityKey", "order", "updatedAt"],
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
      name: "parent",
      type: "relationship",
      relationTo: "services",
      index: true,
      label: t3("Domaine parent", "Parent area", "المجال الأب"),
      validate: validateParent,
      // Top-level services of the same site, not this one.
      filterOptions: ({ id, siblingData }) => {
        const site = idOf((siblingData as { site?: unknown }).site);
        const and: Where[] = [{ parent: { exists: false } }];
        if (site !== null) and.push({ site: { equals: site } });
        if (id !== undefined) and.push({ id: { not_equals: id } });
        return { and };
      },
      admin: {
        position: "sidebar",
        description: t3(
          "Vide = service principal (/services/…). Sinon sous-service de ce domaine (/services/domaine/…).",
          "Empty = main service (/services/…). Otherwise a sub-service of this area (/services/area/…).",
          "فارغ = خدمة رئيسية. وإلا خدمة فرعية لهذا المجال.",
        ),
      },
    },
    {
      name: "showPublicReferences",
      type: "checkbox",
      defaultValue: false,
      label: t3(
        "Afficher toutes les références institutionnelles",
        "Show all public-sector references",
        "عرض كل المراجع العمومية",
      ),
      admin: {
        position: "sidebar",
        description: t3(
          "Liste sur cette page toutes les réalisations « Public / B2G » du site (ex. page Intégrateur B2G).",
          "Lists every “Public / B2G” project of the site on this page (e.g. the B2G integrator page).",
          "يعرض في هذه الصفحة كل إنجازات «القطاع العمومي» للموقع.",
        ),
      },
    },
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
