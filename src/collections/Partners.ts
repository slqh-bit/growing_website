import type { CollectionConfig } from "payload";
import { managedSiteIds, siteContentAccess } from "../cms/access";
import { groups, t3 } from "../cms/labels";
import { revalidateCollection } from "../cms/revalidate";

const httpsUrl = (value: string | null | undefined) =>
  !value || /^https:\/\/[^\s]+$/.test(value) || "Use an https:// URL.";

/**
 * Brands, manufacturers, distributors, certification bodies and the group's own
 * products (plan §2, §5). Shown in the "Partenaires" page block and on the
 * pages of the services they are linked to.
 */
export const Partners: CollectionConfig = {
  slug: "partners",
  labels: {
    singular: t3("Partenaire", "Partner", "شريك"),
    plural: t3("Partenaires & marques", "Partners & brands", "الشركاء والعلامات"),
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "kind", "sites", "showInStrip", "order"],
    group: groups.content,
  },
  defaultSort: "order",
  access: siteContentAccess("sites"),
  hooks: revalidateCollection("partners"),
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, label: t3("Nom", "Name", "الاسم"), admin: { width: "50%" } },
        {
          name: "kind",
          type: "select",
          required: true,
          defaultValue: "manufacturer",
          label: t3("Type", "Type", "النوع"),
          options: [
            { value: "manufacturer", label: t3("Fabricant / marque", "Manufacturer / brand", "مصنّع / علامة") },
            { value: "distributor", label: t3("Distributeur", "Distributor", "موزّع") },
            { value: "own-product", label: t3("Produit du groupe", "Group product", "منتج المجموعة") },
            { value: "certification", label: t3("Organisme / certification", "Body / certification", "هيئة / اعتماد") },
          ],
          admin: { width: "50%" },
        },
      ],
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      required: true,
      label: t3("Logo", "Logo", "الشعار"),
    },
    { name: "url", type: "text", validate: httpsUrl, label: t3("Site web", "Website", "الموقع الإلكتروني") },
    {
      name: "description",
      type: "textarea",
      localized: true,
      label: t3("Description", "Description", "الوصف"),
      admin: {
        description: t3(
          "Optionnel — une phrase, surtout pour les produits du groupe.",
          "Optional — one sentence, mainly for the group's own products.",
          "اختياري — جملة واحدة، خاصة لمنتجات المجموعة.",
        ),
      },
    },
    {
      name: "sites",
      type: "relationship",
      relationTo: "sites",
      hasMany: true,
      required: true,
      label: t3("Sites", "Sites", "المواقع"),
      defaultValue: ({ user }: { user?: unknown }) => managedSiteIds(user)?.slice(0, 1),
      filterOptions: ({ user }) => {
        const ids = managedSiteIds(user);
        return ids ? { id: { in: ids } } : true;
      },
      admin: { position: "sidebar" },
    },
    {
      name: "services",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      label: t3("Services concernés", "Related services", "الخدمات المعنية"),
      admin: {
        position: "sidebar",
        description: t3(
          "Le logo s'affiche aussi sur ces pages de service.",
          "The logo is also shown on these service pages.",
          "يظهر الشعار أيضاً في صفحات هذه الخدمات.",
        ),
      },
    },
    {
      name: "showInStrip",
      type: "checkbox",
      defaultValue: true,
      label: t3("Dans le bandeau « Partenaires »", "In the “Partners” strip", "في شريط «الشركاء»"),
      admin: { position: "sidebar" },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      label: t3("Ordre", "Order", "الترتيب"),
      admin: { position: "sidebar" },
    },
  ],
};
