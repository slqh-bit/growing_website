import type { GlobalConfig } from "payload";
import { admins, anyone } from "../cms/access";
import { groups, t3 } from "../cms/labels";
import { revalidateGlobal } from "../cms/revalidate";

/**
 * The group shared by every site (plan §2, §3.3): its name, the "Le groupe"
 * page (/groupe on each site), the group band in each footer, and the order
 * the member companies are presented in.
 */
export const Group: GlobalConfig = {
  slug: "group",
  label: t3("Groupe", "Group", "المجموعة"),
  admin: { group: groups.settings },
  access: {
    read: anyone,
    update: admins,
  },
  hooks: { afterChange: revalidateGlobal("group") },
  fields: [
    {
      name: "name",
      type: "text",
      localized: true,
      required: true,
      defaultValue: "Groupe Growing & Hikview",
      label: t3("Nom du groupe", "Group name", "اسم المجموعة"),
    },
    {
      name: "tagline",
      type: "textarea",
      localized: true,
      label: t3("Accroche", "Tagline", "الشعار"),
      admin: {
        description: t3(
          "Sous-titre de la page « Le groupe ».",
          "Subtitle of the “Our group” page.",
          "العنوان الفرعي لصفحة «المجموعة».",
        ),
      },
    },
    {
      name: "story",
      type: "richText",
      localized: true,
      label: t3("Présentation", "Presentation", "التقديم"),
    },
    {
      name: "members",
      type: "array",
      label: t3("Sociétés du groupe", "Group companies", "شركات المجموعة"),
      labels: {
        singular: t3("Société", "Company", "شركة"),
        plural: t3("Sociétés", "Companies", "الشركات"),
      },
      admin: {
        description: t3(
          "Ordre et présentation des sociétés (logo, nom et adresse viennent de Sites).",
          "Order and presentation of the companies (logo, name and address come from Sites).",
          "ترتيب الشركات وتقديمها (الشعار والاسم والعنوان من المواقع).",
        ),
      },
      fields: [
        { name: "site", type: "relationship", relationTo: "sites", required: true, label: t3("Site", "Site", "الموقع") },
        {
          name: "summary",
          type: "textarea",
          localized: true,
          label: t3("Présentation courte", "Short presentation", "تقديم قصير"),
        },
      ],
    },
    {
      name: "footerBand",
      type: "checkbox",
      defaultValue: true,
      label: t3(
        "Bandeau du groupe en pied de page",
        "Group band in the footer",
        "شريط المجموعة في تذييل الصفحة",
      ),
      admin: {
        description: t3(
          "Affiche « Membre du groupe … » et les autres sociétés en bas de chaque page.",
          "Shows “Member of … group” and the other companies at the bottom of every page.",
          "يعرض «عضو في مجموعة …» والشركات الأخرى أسفل كل صفحة.",
        ),
      },
    },
  ],
};
