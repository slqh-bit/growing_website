import { APIError, type CollectionConfig } from "payload";
import { pageBlocks } from "../blocks/config";
import { admins, anyone, authenticated } from "../cms/access";
import { seoField, slugField } from "../cms/fields";
import { groups, t3 } from "../cms/labels";
import { revalidateCollection } from "../cms/revalidate";

/** Flexible, block-built marketing pages: Home (slug "home"), About… (devplan §4.3). */
export const Pages: CollectionConfig = {
  slug: "pages",
  labels: {
    singular: t3("Page", "Page", "صفحة"),
    plural: t3("Pages", "Pages", "الصفحات"),
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "updatedAt"],
    group: groups.content,
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: admins,
  },
  hooks: {
    ...revalidateCollection("pages"),
    beforeDelete: [
      // The home page is the site root (/fr, /ar, /en): deleting it would take the site offline.
      async ({ id, req }) => {
        const page = await req.payload.findByID({ collection: "pages", id, depth: 0, req });
        if (page.slug === "home") {
          throw new APIError(
            req.i18n.language === "ar"
              ? "لا يمكن حذف الصفحة الرئيسية."
              : req.i18n.language === "en"
                ? "The home page cannot be deleted."
                : "La page d'accueil ne peut pas être supprimée.",
            403,
          );
        }
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
    },
    slugField(),
    {
      name: "layout",
      type: "blocks",
      blocks: pageBlocks,
      label: t3("Sections", "Sections", "الأقسام"),
      labels: {
        singular: t3("Section", "Section", "قسم"),
        plural: t3("Sections", "Sections", "الأقسام"),
      },
    },
    seoField,
  ],
};
