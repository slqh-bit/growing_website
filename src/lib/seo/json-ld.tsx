import type { Locale } from "@/i18n/config";
import type { Service, Site } from "@/payload-types";
import { siteOrigin } from "@/lib/metadata";

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

const orgId = (origin: string) => `${origin}/#organization`;

/** The company as a LocalBusiness (Electrician is a LocalBusiness subtype). */
export function localBusinessLd(settings: Site, locale: Locale, description: string): object {
  const origin = siteOrigin(settings);
  const sameAs = [settings.socials?.facebook, settings.socials?.instagram, settings.socials?.linkedin].filter(
    (url): url is string => Boolean(url),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Electrician",
    "@id": orgId(origin),
    name: settings.companyName,
    legalName: settings.legalName,
    description,
    url: `${origin}/${locale}`,
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

/** `origin`: the site's public origin (siteOrigin); `path`: the service's locale-less path. */
export function serviceLd(service: Service, locale: Locale, origin: string, path: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDescription,
    serviceType: service.title,
    url: `${origin}/${locale}${path}`,
    provider: { "@id": orgId(origin) },
    areaServed: { "@type": "Country", name: "Tunisia" },
    inLanguage: locale,
  };
}

/** Breadcrumb trail, e.g. Home › Services › Pompage solaire. */
export function breadcrumbLd(items: { name: string; path: string }[], locale: Locale, origin: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${origin}/${locale}${item.path}`,
    })),
  };
}
