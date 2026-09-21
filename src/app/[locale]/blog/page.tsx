import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { ComingSoon } from "@/components/sections/coming-soon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tn = await getTranslations({ locale, namespace: "nav" });
  return { title: tn("blog") };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations({ locale, namespace: "nav" });
  return <ComingSoon locale={locale} title={tn("blog")} />;
}
