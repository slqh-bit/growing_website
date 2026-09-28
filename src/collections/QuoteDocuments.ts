import { APIError, type CollectionConfig } from "payload";
import { admins, authenticated } from "../cms/access";
import { groups, t3 } from "../cms/labels";
import { MAX_QUOTE_BYTES, quotesDir } from "../lib/devis/quote-files";

/**
 * Quote PDFs attached to quote requests (DevisRequests.quote) and emailed to
 * the client at "Devis envoyé". Private: staff-only, stored outside media/.
 */
export const QuoteDocuments: CollectionConfig = {
  slug: "quote-documents",
  labels: {
    singular: t3("Devis (PDF)", "Quote (PDF)", "تسعيرة (PDF)"),
    plural: t3("Devis (PDF)", "Quotes (PDF)", "التسعيرات (PDF)"),
  },
  admin: {
    group: groups.leads,
    defaultColumns: ["filename", "filesize", "createdAt"],
    description: t3(
      "Devis envoyés aux clients. Visibles uniquement par l'équipe.",
      "Quotes sent to clients. Visible to the team only.",
      "التسعيرات المُرسلة إلى العملاء. لا يطّلع عليها إلا الفريق.",
    ),
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: admins,
  },
  upload: {
    staticDir: quotesDir,
    mimeTypes: ["application/pdf"],
  },
  hooks: {
    beforeValidate: [
      ({ req, data }) => {
        if (req.file && req.file.size > MAX_QUOTE_BYTES) {
          throw new APIError(
            `Le PDF dépasse ${MAX_QUOTE_BYTES / 1024 / 1024} Mo. Compressez-le avant de l'envoyer.`,
            400,
            null,
            true,
          );
        }
        return data;
      },
    ],
  },
  fields: [],
};
