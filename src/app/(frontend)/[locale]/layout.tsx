import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages, getTranslations } from "next-intl/server";
import { getDir, isValidLocale, type Locale } from "@/i18n/routing";
import { latin } from "@/app/fonts";
import { ThemeProvider, initScript } from "@/components/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getNavigation, getSiteSettings } from "@/lib/cms/queries";
import { siteUrl } from "@/lib/metadata";
import { JsonLd, localBusinessLd } from "@/lib/seo/json-ld";
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
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "common" }),
    getSiteSettings(locale),
  ]);

  // No `alternates` here on purpose: canonical/hreflang are set per page via
  // buildMetadata(), so 404s and future pages never inherit the home canonical.
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${settings.companyName} — ${t("companyTagline")}`,
      template: `%s — ${settings.companyName}`,
    },
    description: t("companyTagline"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const dir = getDir(locale);
  const plausibleDomain = process.env.PLAUSIBLE_DOMAIN;
  const [messages, t, navigation, settings] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: "common" }),
    getNavigation(locale),
    getSiteSettings(locale),
  ]);

  return (
    <html
      lang={locale}
      dir={dir}
      className={latin.variable}
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
              <SiteHeader items={navigation.items ?? []} companyName={settings.companyName} />
              <main id="main" className="flex-1">
                {children}
              </main>
              <SiteFooter locale={locale} />
              <JsonLd data={localBusinessLd(settings, locale, t("companyTagline"))} />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
