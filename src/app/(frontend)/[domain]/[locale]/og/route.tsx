import { ImageResponse } from "next/og";
import { isValidLocale } from "@/i18n/routing";
import { getSite } from "@/lib/cms/queries";
import { siteOrigin } from "@/lib/metadata";
import { resolveSiteKey } from "@/lib/site";
import { brandHex } from "@/lib/theme";

/** The image renderer has no Arabic shaping: Arabic text is replaced by the French tagline. */
const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/**
 * Default share image (1200 × 630) of a page without its own (plan Phase 7):
 * the site's colours, initials, name, the page title and its domain. Used by
 * buildMetadata when neither the page (SEO → image) nor the site (Sites →
 * Image de partage par défaut) has one.
 */
export async function GET(request: Request, { params }: { params: Promise<{ domain: string; locale: string }> }) {
  const { domain, locale } = await params;
  const site = await resolveSiteKey(domain);
  const settings = await getSite(site, isValidLocale(locale) && locale !== "ar" ? locale : "fr");
  const colours = brandHex(settings.theme);

  const requested = new URL(request.url).searchParams.get("title")?.trim().slice(0, 140) ?? "";
  const title = requested && !ARABIC.test(requested) ? requested : settings.tagline;
  const initials = settings.monogram || settings.companyName.slice(0, 2).toUpperCase();
  const host = new URL(siteOrigin(settings)).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          color: "#fff",
          backgroundImage: `linear-gradient(135deg, ${colours.from} 0%, ${colours.to} 100%)`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 88,
              height: 88,
              borderRadius: 22,
              background: "#fff",
              color: colours.from,
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            {initials}
          </div>
          <div style={{ fontSize: 40, fontWeight: 700 }}>{settings.companyName}</div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: title.length > 70 ? 52 : 64,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: -1,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28, opacity: 0.9 }}>
          <div style={{ width: 48, height: 6, borderRadius: 3, background: colours.accent }} />
          {host}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
    },
  );
}
