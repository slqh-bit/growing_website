import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { routeContext } from "@/lib/site";
import { getSite } from "@/lib/cms/queries";
import { buildMetadata } from "@/lib/metadata";
import { ComingSoon } from "@/components/sections/coming-soon";

type Params = Promise<{ domain: string; locale: Locale }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { site, locale } = await routeContext(params);
  const tn = await getTranslations({ locale, namespace: "nav" });
  // "Coming soon" stub (plan Phase 9): out of the index until job offers are published.
  return buildMetadata({ site, locale, path: "/carrieres", title: tn("careers"), noindex: true });
}

/** Careers placeholder: meanwhile, open applications go to the site's email (Sites → Contact). */
export default async function CareersPage({ params }: { params: Params }) {
  const { site, locale } = await routeContext(params);
  setRequestLocale(locale);
  const [tn, t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "upcoming.careers" }),
    getSite(site, locale),
  ]);
  const subject = encodeURIComponent(`${t("subject")} — ${settings.companyName}`);
  return (
    <ComingSoon
      locale={locale}
      icon="Briefcase"
      title={tn("careers")}
      description={t("body")}
      action={{ href: `mailto:${settings.email}?subject=${subject}`, label: t("cta") }}
    />
  );
}
