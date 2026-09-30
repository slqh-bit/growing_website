import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { redirectOrNotFound, routeContext } from "@/lib/site";
import { getServiceBySlug, getServices } from "@/lib/cms/queries";
import { buildMetadata } from "@/lib/metadata";
import { servicePath } from "@/lib/services";
import { ServiceDetail } from "@/components/sections/service-detail";

/** A sub-service of an area: /services/<area>/<sub> (plan §4.2). */
type Params = Promise<{ domain: string; locale: Locale; slug: string; sub: string }>;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { site, locale, sub } = await routeContext(params);
  const service = await getServiceBySlug(site, sub, locale);
  if (!service) return {};
  return buildMetadata({
    site,
    locale,
    path: servicePath(service, await getServices(site, locale)),
    title: service.title,
    description: service.shortDescription,
    image: service.heroImage,
    seo: service.seo,
  });
}

export default async function SubServicePage({ params }: { params: Params }) {
  const { site, locale, slug, sub } = await routeContext(params);
  setRequestLocale(locale);

  const requested = `/services/${decodeURIComponent(slug)}/${decodeURIComponent(sub)}`;
  const service = await getServiceBySlug(site, sub, locale);
  if (!service) return redirectOrNotFound(site, locale, requested);
  // Moved to another area, or not a sub-service: its canonical URL.
  const path = servicePath(service, await getServices(site, locale));
  if (path !== requested) permanentRedirect(`/${locale}${path}`);

  return <ServiceDetail site={site} locale={locale} service={service} />;
}
