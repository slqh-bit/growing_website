import type { CollectionConfig } from "payload";
import { siteContentAccess } from "../cms/access";
import { siteField } from "../cms/fields";
import { groups, t3 } from "../cms/labels";
import { revalidateCollection } from "../cms/revalidate";

/** FAQ entries (devplan §4.4), grouped by category on the FAQ page. */
export const Faq: CollectionConfig = {
  slug: "faq",
  labels: {
    singular: t3("Question", "FAQ item", "سؤال"),
    plural: t3("FAQ", "FAQ", "الأسئلة الشائعة"),
  },
  admin: {
    useAsTitle: "question",
    defaultColumns: ["question", "category", "order", "site"],
    group: groups.content,
  },
  defaultSort: "order",
  access: siteContentAccess(),
  hooks: revalidateCollection("faq"),
  fields: [
    siteField(),
    {
      name: "question",
      type: "text",
      localized: true,
      required: true,
      label: t3("Question", "Question", "السؤال"),
    },
    {
      name: "answer",
      type: "textarea",
      localized: true,
      required: true,
      label: t3("Réponse", "Answer", "الإجابة"),
    },
    {
      type: "row",
      fields: [
        {
          name: "category",
          type: "text",
          localized: true,
          required: true,
          label: t3("Catégorie", "Category", "الفئة"),
          admin: {
            width: "70%",
            description: t3(
              "Même libellé = même groupe, ex. « Subventions ».",
              "Same label = same group, e.g. “Subsidies”.",
              "نفس التسمية = نفس المجموعة، مثل «المنح».",
            ),
          },
        },
        {
          name: "order",
          type: "number",
          required: true,
          defaultValue: 0,
          label: t3("Ordre", "Order", "الترتيب"),
          admin: { width: "30%" },
        },
      ],
    },
  ],
};
