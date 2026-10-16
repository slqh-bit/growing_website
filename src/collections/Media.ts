import path from "path";
import type { CollectionConfig } from "payload";
import { adminsFieldLevel, anyone, managedSiteIds, siteContentAccess } from "../cms/access";
import { groups, t3 } from "../cms/labels";
import { revalidateCollection } from "../cms/revalidate";
import { workspaceFilter, workspaceSiteId } from "../cms/workspace-server";

/**
 * Uploads (devplan §4.7). Stored on local disk in v1 (`/media`, a Docker volume
 * in production); swap for an S3-compatible adapter later without schema changes.
 *
 * Each image belongs to the sites that use it (`sites`): editors only replace
 * or retitle their own companies' images, administrators delete.
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
    baseFilter: workspaceFilter("sites"),
  },
  access: {
    ...siteContentAccess("sites"),
    // Files are served through read access (/api/media/file/…): scoping it
    // would break the other companies' images for a logged-in editor browsing
    // their sites. Everything here is public anyway.
    read: anyone,
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
  hooks: revalidateCollection("media"),
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
    {
      name: "sites",
      type: "relationship",
      relationTo: "sites",
      hasMany: true,
      required: true,
      label: t3("Sites", "Sites", "المواقع"),
      defaultValue: async ({ req }) => [await workspaceSiteId(req)].filter((id) => id !== undefined),
      // Set on upload (the workspace); only administrators share or move an
      // image afterwards, so an editor can't hand one to another company.
      access: { update: adminsFieldLevel },
      // Uploads only: an editor saving an image shared with another company
      // keeps that company's site, which their own choices wouldn't include.
      filterOptions: ({ id, user }) => {
        const ids = id ? null : managedSiteIds(user);
        return ids ? { id: { in: ids } } : true;
      },
      admin: {
        position: "sidebar",
        description: t3(
          "Les sites qui utilisent cette image : leurs éditeurs peuvent la remplacer ou modifier son texte.",
          "The websites that use this image: their editors can replace it or change its text.",
          "المواقع التي تستعمل هذه الصورة: يمكن لمحرّريها استبدالها أو تعديل نصّها.",
        ),
      },
    },
  ],
};
