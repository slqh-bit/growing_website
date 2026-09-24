import path from "path";
import type { CollectionConfig } from "payload";
import { anyone, authenticated } from "../cms/access";
import { groups, t3 } from "../cms/labels";

/**
 * Uploads (devplan §4.7). Stored on local disk in v1 (`/media`, a Docker volume
 * in production); swap for an S3-compatible adapter later without schema changes.
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: t3("Média", "Media", "وسيط"),
    plural: t3("Médias", "Media", "الوسائط"),
  },
  admin: {
    group: groups.media,
    defaultColumns: ["filename", "alt", "updatedAt"],
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  upload: {
    staticDir: path.resolve(process.cwd(), "media"),
    // Raster images only: SVG can carry scripts and is served from our origin.
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    focalPoint: true,
    adminThumbnail: "thumbnail",
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 800, height: 500, position: "centre" },
      { name: "hero", width: 1920, withoutEnlargement: true },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      localized: true,
      required: true,
      label: t3("Texte alternatif", "Alt text", "النص البديل"),
      admin: {
        description: t3(
          "Décrit l'image pour les lecteurs d'écran et le SEO (à traduire dans chaque langue).",
          "Describes the image for screen readers and SEO (translate in each language).",
          "يصف الصورة لقارئات الشاشة ومحركات البحث (يُترجم في كل لغة).",
        ),
      },
    },
  ],
};
