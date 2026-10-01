import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routeContext } from "@/lib/site";
import { buildMetadata } from "@/lib/metadata";
import { ComingSoon } from "@/components/sections/coming-soon";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; locale: Locale }>;
}): Promise<Metadata> {
  const { site, locale } = await routeContext(params);
  const tn = await getTranslations({ locale, namespace: "nav" });
  // "Coming soon" stub: keep it out of the index until real articles exist.
  return buildMetadata({ site, locale, path: "/blog", title: tn("blog"), noindex: true });
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ domain: string; locale: Locale }>;
}) {
  const { locale } = await routeContext(params);
  setRequestLocale(locale);
  const [tn, t] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "upcoming.news" }),
  ]);
  return (
    <ComingSoon
      locale={locale}
      icon="Newspaper"
      title={tn("blog")}
      description={t("body")}
      action={{ href: "/projects", label: t("cta") }}
    />
  );
}
