import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routeContext } from "@/lib/site";
import { buildMetadata } from "@/lib/metadata";
import { ComingSoon } from "@/components/sections/coming-soon";

type Params = Promise<{ domain: string; locale: Locale }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { site, locale } = await routeContext(params);
  const tn = await getTranslations({ locale, namespace: "nav" });
  // "Coming soon" stub (plan Phase 9): out of the index until the client area exists.
  return buildMetadata({ site, locale, path: "/espace-client", title: tn("clientArea"), noindex: true });
}

/** Client area placeholder: meanwhile, clients track their request on /suivi. */
export default async function ClientAreaPage({ params }: { params: Params }) {
  const { locale } = await routeContext(params);
  setRequestLocale(locale);
  const [tn, t] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "upcoming.clientArea" }),
  ]);
  return (
    <ComingSoon
      locale={locale}
      icon="UserRound"
      title={tn("clientArea")}
      description={t("body")}
      action={{ href: "/suivi", label: t("cta") }}
    />
  );
}
