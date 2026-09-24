import type { CollectionConfig } from "payload";
import { pageBlocks } from "../blocks/config";
import { admins, anyone, authenticated } from "../cms/access";
import { seoField, slugField } from "../cms/fields";
import { groups, t3 } from "../cms/labels";

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
