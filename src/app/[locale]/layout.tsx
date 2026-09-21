import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages, getTranslations } from "next-intl/server";
import { routing, getDir, isValidLocale, type Locale } from "@/i18n/routing";
import { latin, arabic } from "@/app/fonts";
import { ThemeProvider, themeInitScript } from "@/components/theme-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { siteSettings } from "@/content/site";
import "@/styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteSettings.companyName} — ${t("companyTagline")}`,
      template: `%s — ${siteSettings.companyName}`,
    },
    description: t("companyTagline"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        fr: "/fr",
        ar: "/ar",
        en: "/en",
      },
    },
    openGraph: {
      type: "website",
      siteName: siteSettings.companyName,
      title: `${siteSettings.companyName} — ${t("companyTagline")}`,
      description: t("companyTagline"),
      locale,
    },
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
  const messages = await getMessages();

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${latin.variable} ${arabic.variable} min-h-dvh antialiased`}>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white"
            >
              {locale === "ar" ? "تخطَّ إلى المحتوى" : locale === "fr" ? "Aller au contenu" : "Skip to content"}
            </a>
            <div className="flex min-h-dvh flex-col">
              <SiteHeader />
              <main id="main" className="flex-1">
                {children}
              </main>
              <SiteFooter locale={locale as Locale} />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
