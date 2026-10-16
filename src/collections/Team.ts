import type { CollectionConfig } from "payload";
import { siteContentAccess } from "../cms/access";
import { siteField } from "../cms/fields";
import { groups, t3 } from "../cms/labels";
import { revalidateCollection } from "../cms/revalidate";
import { workspaceFilter } from "../cms/workspace-server";

/** Team members (devplan §4.5). The /team page stays "Coming soon" while empty. */
export const Team: CollectionConfig = {
  slug: "team",
  labels: {
    singular: t3("Membre", "Team member", "عضو"),
    plural: t3("Équipe", "Team", "الفريق"),
  },
  admin: {
    baseFilter: workspaceFilter("site"),
    useAsTitle: "name",
    defaultColumns: ["name", "role", "order"],
    group: groups.content,
  },
  defaultSort: "order",
  access: siteContentAccess(),
  hooks: revalidateCollection("team"),
  fields: [
    siteField(),
    {
      name: "name",
      type: "text",
      required: true,
      label: t3("Nom", "Name", "الاسم"),
    },
    {
      name: "role",
      type: "text",
      localized: true,
      required: true,
      label: t3("Fonction", "Role", "الوظيفة"),
    },
    {
      name: "photo",
      type: "upload",
      relationTo: "media",
      label: t3("Photo", "Photo", "الصورة"),
    },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 0,
      label: t3("Ordre", "Order", "الترتيب"),
      admin: { position: "sidebar" },
    },
  ],
};
