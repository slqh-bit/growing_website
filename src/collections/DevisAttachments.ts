import type { CollectionConfig } from "payload";
import { admins, authenticated, ownSites } from "../cms/access";
import { siteField } from "../cms/fields";
import { groups, t3 } from "../cms/labels";
import { attachmentMimeTypes } from "../lib/devis/attachments";
import { attachmentsDir } from "../lib/devis/quote-files";

/**
 * Files attached by clients to their quote requests (plans, photos, tender
 * specifications). Private: staff of the request's site only, stored outside
 * media/. Created by the quote form's server action; the team can also add
 * files to a request by hand.
 */
export const DevisAttachments: CollectionConfig = {
  slug: "devis-attachments",
  labels: {
    singular: t3("Pièce jointe client", "Client attachment", "مرفق العميل"),
    plural: t3("Pièces jointes clients", "Client attachments", "مرفقات العملاء"),
  },
  admin: {
    group: groups.leads,
    useAsTitle: "filename",
    defaultColumns: ["filename", "site", "filesize", "createdAt"],
    description: t3(
      "Fichiers envoyés par les clients avec leur demande de devis. Visibles uniquement par l'équipe.",
      "Files sent by clients with their quote request. Visible to the team only.",
      "ملفات أرسلها العملاء مع طلب التسعيرة. لا يطّلع عليها إلا الفريق.",
    ),
  },
  access: {
    read: ownSites,
    create: authenticated,
    update: ownSites,
    delete: admins,
  },
  upload: {
    staticDir: attachmentsDir,
    mimeTypes: attachmentMimeTypes,
  },
  fields: [siteField()],
};
