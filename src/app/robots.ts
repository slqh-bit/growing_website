import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { defaultLocale } from "@/i18n/config";
import { getSite } from "@/lib/cms/queries";
import { siteOrigin } from "@/lib/metadata";
import { resolveSiteKey } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * robots.txt — public pages crawlable; CMS admin and API excluded, except the
 * public files served through the API (images, public company documents).
 * Per domain (site).
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await resolveSiteKey((await headers()).get("host") ?? "localhost");
  const origin = siteOrigin(await getSite(site, defaultLocale));
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/media/file/", "/api/company-documents/file/"],
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
