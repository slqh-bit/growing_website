import type { Locale } from "@/i18n/config";
import type { Group, Service, Site } from "@/payload-types";
import { imageSource } from "@/lib/cms/media";
import { siteOrigin } from "@/lib/metadata";

/**
 * schema.org structured data (JSON-LD, plan Phase 7): each company as its own
 * LocalBusiness subtype (Sites → Type d'activité) with the group as
 * `parentOrganization`, the site as a WebSite, services and breadcrumbs.
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

type SiteLike = Pick<Site, "url" | "domains">;

export const orgId = (site: SiteLike) => `${siteOrigin(site)}/#organization`;
const websiteId = (site: SiteLike) => `${siteOrigin(site)}/#website`;
export const groupId = (site: SiteLike) => `${siteOrigin(site)}/#group`;

/** An upload as an absolute URL on the site's origin. */
function absoluteImage(site: SiteLike, value: Site["logo"]): string | undefined {
  const image = imageSource(value);
  return image ? `${siteOrigin(site)}${image.src}` : undefined;
}

/** The group, when it has a name and more than one company: announced as each company's parent. */
export interface GroupRef {
  name: string;
  /** Path of the group page on this site, e.g. "/groupe". */
  path: string;
}

/** The company (Sites → Entreprise), as the LocalBusiness subtype chosen in the admin. */
export function organizationLd(settings: Site, locale: Locale, group: GroupRef | null): object {
  const origin = siteOrigin(settings);
  const sameAs = [settings.socials?.facebook, settings.socials?.instagram, settings.socials?.linkedin].filter(
    (url): url is string => Boolean(url),
  );
  const logo = absoluteImage(settings, settings.logo);
  return {
    "@context": "https://schema.org",
    "@type": settings.businessType || "LocalBusiness",
    "@id": orgId(settings),
    name: settings.companyName,
    legalName: settings.legalName,
    description: settings.tagline,
    url: `${origin}/${locale}`,
    ...(logo && { logo, image: logo }),
    telephone: settings.phone,
    email: settings.email,
    taxID: settings.matriculeFiscal,
    ...(settings.rne && {
      identifier: { "@type": "PropertyValue", propertyID: "RNE", value: settings.rne },
    }),
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
    ...(group && {
      parentOrganization: {
        "@type": "Organization",
        "@id": groupId(settings),
        name: group.name,
        url: `${origin}/${locale}${group.path}`,
      },
    }),
  };
}

/** The website itself, published by the company (the group, on the group site), in the page's language. */
export function websiteLd(settings: Site, locale: Locale): object {
  const publisher = settings.key === "group" ? groupId(settings) : orgId(settings);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId(settings),
    name: settings.companyName,
    url: `${siteOrigin(settings)}/${locale}`,
    inLanguage: locale,
    publisher: { "@id": publisher },
  };
}

/** "Le groupe" page: the group and its companies, each pointing to its own site's entity. */
export function groupLd(settings: Site, locale: Locale, group: Group, members: Site[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": groupId(settings),
    name: group.name,
    ...(group.tagline && { description: group.tagline }),
    url: `${siteOrigin(settings)}/${locale}/groupe`,
    subOrganization: members.map((member) => ({
      "@type": member.businessType || "LocalBusiness",
      "@id": orgId(member),
      name: member.companyName,
      legalName: member.legalName,
      url: `${siteOrigin(member)}/${locale}`,
    })),
  };
}

/** `origin`: the site's public origin (siteOrigin); `path`: the service's locale-less path. */
export function serviceLd(service: Service, locale: Locale, settings: Site, path: string): object {
  const origin = siteOrigin(settings);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.shortDescription,
    serviceType: service.title,
    url: `${origin}/${locale}${path}`,
    provider: { "@type": settings.businessType || "LocalBusiness", "@id": orgId(settings), name: settings.companyName },
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
