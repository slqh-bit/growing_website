import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { redirectOrNotFound, routeContext } from "@/lib/site";
import { getServiceBySlug, getServices } from "@/lib/cms/queries";
import { buildMetadata } from "@/lib/metadata";
import { parentId, servicePath } from "@/lib/services";
import { ServiceDetail } from "@/components/sections/service-detail";

/** A top-level service (Growing activity, Hikview area). Sub-services live at /services/<area>/<sub>. */
type Params = Promise<{ domain: string; locale: Locale; slug: string }>;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { site, locale, slug } = await routeContext(params);
  const service = await getServiceBySlug(site, slug, locale);
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

export default async function ServicePage({ params }: { params: Params }) {
  const { site, locale, slug } = await routeContext(params);
  setRequestLocale(locale);

  const service = await getServiceBySlug(site, slug, locale);
  if (!service) return redirectOrNotFound(site, locale, `/services/${decodeURIComponent(slug)}`);
  // A sub-service reached at the top level (old link, rich-text link): canonical nested URL.
  if (parentId(service) !== null) permanentRedirect(`/${locale}${servicePath(service, await getServices(site, locale))}`);

  return <ServiceDetail site={site} locale={locale} service={service} />;
}
