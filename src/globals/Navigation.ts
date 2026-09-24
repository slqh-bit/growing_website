import type { GlobalConfig } from "payload";
import { admins, anyone } from "../cms/access";
import { linkFields } from "../cms/fields";
import { groups, t3 } from "../cms/labels";
import { revalidateGlobal } from "../cms/revalidate";

/** Header navigation (devplan §4.8). The "Demander un devis" CTA stays in UI chrome. */
export const Navigation: GlobalConfig = {
  slug: "navigation",
  label: t3("Navigation", "Navigation", "القائمة"),
  admin: { group: groups.settings },
  access: {
    read: anyone,
    update: admins,
  },
  hooks: { afterChange: revalidateGlobal("navigation") },
  fields: [
    {
      name: "items",
      type: "array",
      maxRows: 8,
      label: t3("Liens du menu", "Menu links", "روابط القائمة"),
      fields: [
        {
          type: "row",
          fields: [
            ...linkFields(),
            {
              name: "comingSoon",
              type: "checkbox",
              defaultValue: false,
              label: t3("« Bientôt »", "“Coming soon”", "«قريباً»"),
            },
          ],
        },
      ],
    },
  ],
};
