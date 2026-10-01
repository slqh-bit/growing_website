import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages, getTranslations } from "next-intl/server";
import { getDir, isValidLocale, type Locale } from "@/i18n/routing";
import { latin } from "@/app/fonts";
import { ThemeProvider, initScript } from "@/components/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { brandOf } from "@/components/brand/logo";
import { getSite } from "@/lib/cms/queries";
import { imageSource } from "@/lib/cms/media";
import { siteOrigin } from "@/lib/metadata";
import { resolveSiteKey } from "@/lib/site";
import { themeVars } from "@/lib/theme";
import { getGroupMembers } from "@/lib/group";
import { groupLd, JsonLd, organizationLd, websiteLd, type GroupRef } from "@/lib/seo/json-ld";
import "@/styles/globals.css";

/**
 * Incremental static regeneration without build-time database access:
 * no page is prerendered at build; each is rendered on its first request,
 * cached, and re-rendered only when CMS content it uses changes (cache tags
 * revalidated by the Payload hooks in src/cms/revalidate.ts).
 */
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; locale: Locale }>;
}): Promise<Metadata> {
  const { domain, locale } = await params;
  const settings = await getSite(await resolveSiteKey(domain), locale);
  const favicon = imageSource(settings.favicon);

  // No `alternates` here on purpose: canonical/hreflang are set per page via
  // buildMetadata(), so 404s and future pages never inherit the home canonical.
  return {
    metadataBase: new URL(siteOrigin(settings)),
    title: {
      default: `${settings.companyName} — ${settings.tagline}`,
      template: `%s — ${settings.companyName}`,
    },
    description: settings.tagline,
    // Per-site tab icon (Sites → Marque); the defaults live in /public.
    icons: favicon
      ? { icon: favicon.src, apple: favicon.src }
      : {
          icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/icon.svg", type: "image/svg+xml" },
          ],
          apple: "/apple-icon.png",
        },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ domain: string; locale: string }>;
}) {
  const { domain, locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }
  const site = await resolveSiteKey(domain);

  setRequestLocale(locale);
  const dir = getDir(locale);
  const [messages, t, settings, { group, members }] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: "common" }),
    getSite(site, locale),
    getGroupMembers(locale),
  ]);
  // The group is announced as each company's parent once it has a name and several companies.
  const groupRef: GroupRef | null = group.name && members.length > 1 ? { name: group.name, path: "/groupe" } : null;
  // Plausible is on when PLAUSIBLE_DOMAIN is set; each site is measured under its own domain.
  const plausibleDomain = process.env.PLAUSIBLE_DOMAIN
    ? settings.url || settings.domains?.[0]?.domain
      ? new URL(siteOrigin(settings)).hostname
      : process.env.PLAUSIBLE_DOMAIN
    : undefined;

  return (
    <html
      lang={locale}
      dir={dir}
      className={latin.variable}
      // Site colours (Sites → Marque): hue/intensity of the CSS palettes.
      style={themeVars(settings.theme) as React.CSSProperties}
      data-site={site}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: initScript }} />
        {plausibleDomain && (
          // Cookie-free audience measurement (see politique-confidentialite).
          <script
            defer
            data-domain={plausibleDomain}
            src={process.env.PLAUSIBLE_SRC || "https://plausible.io/js/script.js"}
          />
        )}
      </head>
      <body className="min-h-dvh antialiased">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white"
            >
              {t("skipToContent")}
            </a>
            <div className="flex min-h-dvh flex-col">
              <SiteHeader items={settings.navItems ?? []} brand={brandOf(settings)} />
              <main id="main" className="flex-1">
                {children}
              </main>
              <SiteFooter locale={locale} site={site} />
              {/* The group site describes the group and its companies; a company site, itself within the group. */}
              <JsonLd
                data={
                  site === "group"
                    ? groupLd(settings, locale, group, members.map((m) => m.site))
                    : organizationLd(settings, locale, groupRef)
                }
              />
              <JsonLd data={websiteLd(settings, locale)} />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
