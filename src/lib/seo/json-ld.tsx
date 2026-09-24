import type { Locale } from "@/i18n/config";
import type { Service, SiteSetting } from "@/payload-types";
import { siteUrl } from "@/lib/metadata";

/**
 * schema.org structured data (JSON-LD) — devplan §7: LocalBusiness + Service.
 * Rendered as <script type="application/ld+json">; "<" is escaped so CMS text
 * can never close the script tag (no HTML injection through content).
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

const orgId = () => `${siteUrl}/#organization`;

/** The company as a LocalBusiness (Electrician is a LocalBusiness subtype). */
export function localBusinessLd(settings: SiteSetting, locale: Locale, description: string): object {
  const sameAs = [settings.socials?.facebook, settings.socials?.instagram, settings.socials?.linkedin].filter(
    (url): url is string => Boolean(url),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Electrician",
    "@id": orgId(),
    name: settings.companyName,
    legalName: settings.legalName,
    description,
    url: `${siteUrl}/${locale}`,
    telephone: settings.phone,
    email: settings.email,
    taxID: settings.matriculeFiscal,
    ...(settings.certification && { award: settings.certification }),
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: settings.city,
      addressCountry: "TN",
    },
    geo: { "@type": "GeoCoordinates", latitude: settings.coords.lat, longitude: settings.coords.lng },
    areaServed: { "@type": "Country", name: "Tunisia" },
    knowsLanguage: ["ar", "fr", "en"],
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function serviceLd(service: Service, locale: Locale): object {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDescription,
    serviceType: service.title,
    url: `${siteUrl}/${locale}/services/${service.slug}`,
    provider: { "@id": orgId() },
    areaServed: { "@type": "Country", name: "Tunisia" },
    inLanguage: locale,
  };
}

/** Breadcrumb trail, e.g. Home › Services › Pompage solaire. */
export function breadcrumbLd(items: { name: string; path: string }[], locale: Locale): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}/${locale}${item.path}`,
    })),
  };
}
