import type { GlobalConfig } from "payload";
import { admins, anyone } from "../cms/access";
import { linkFields } from "../cms/fields";
import { groups, t3 } from "../cms/labels";
import { revalidateGlobal } from "../cms/revalidate";

/** Footer content (devplan §4.8). Activities and contacts come from Services / SiteSettings. */
export const Footer: GlobalConfig = {
  slug: "footer",
  label: t3("Pied de page", "Footer", "تذييل الصفحة"),
  admin: { group: groups.settings },
  access: {
    read: anyone,
    update: admins,
  },
  hooks: { afterChange: revalidateGlobal("footer") },
  fields: [
    {
      name: "tagline",
      type: "textarea",
      localized: true,
      label: t3("Accroche", "Tagline", "الشعار"),
    },
    {
      name: "quickLinks",
      type: "array",
      maxRows: 10,
      label: t3("Liens rapides", "Quick links", "روابط سريعة"),
      fields: [{ type: "row", fields: linkFields() }],
    },
    {
      name: "legalLinks",
      type: "array",
      maxRows: 5,
      label: t3("Liens légaux", "Legal links", "روابط قانونية"),
      fields: [{ type: "row", fields: linkFields() }],
    },
  ],
};
