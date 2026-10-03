import type { SiteKey } from "../../src/sites/config";
import type { Localized } from "./types";
import type { BusinessType } from "../../src/lib/seo/business-types";
import type { NavItem } from "./navigation";

/**
 * The group's websites — mirrors the Payload `Sites` collection (plan §2, §5).
 * Seeded only when missing: once a site exists, the admin is its only source.
 * Contacts marked TODO are placeholders to replace in the admin.
 */
export interface SiteSeed {
  key: SiteKey;
  isDefault: boolean;
  companyName: string;
  legalName: string;
  matriculeFiscal: string;
  certification: string;
  /** schema.org type announced to search engines (src/lib/seo/business-types.ts). */
  businessType: BusinessType;
  tagline: Localized;
  servicesIntro: Localized;
  monogram: string;
  /** Uploaded as the logo when the site has none (path from the repo root). */
  logoFile?: string;
  theme: { primary: string | null; accent: string | null };
  email: string;
  phone: string;
  whatsapp: string;
  telegram: string;
  address: Localized;
  city: Localized;
  coords: { lat: number; lng: number };
  socials: { facebook: string; instagram: string; linkedin: string };
  stats: { value: string; label: Localized }[];
  /** Second line of the wordmark (group: "GROUPE"). */
  logoSubline?: Localized;
  /** Menu and footer links when they differ from the companies' (./navigation). */
  nav?: NavItem[];
  footerLinks?: NavItem[];
}

const sbeitla = {
  address: {
    fr: "Rue Marroc, Sbeitla 1250, Kasserine, Tunisie",
    ar: "نهج المغرب، سبيطلة 1250، القصرين، تونس",
    en: "Rue Marroc, Sbeitla 1250, Kasserine, Tunisia",
  } satisfies Localized,
  city: { fr: "Sbeitla", ar: "سبيطلة", en: "Sbeitla" } satisfies Localized,
  // Approximate coordinates of Sbeitla (used for the contact map).
  coords: { lat: 35.2372, lng: 9.1214 },
};

export const sites: SiteSeed[] = [
  {
    key: "growing",
    isDefault: true,
    companyName: "Growing Technologies",
    legalName: "Growing Technologies",
    matriculeFiscal: "1739065/C/A/M/000",
    certification: "ANME",
    businessType: "Electrician",
    tagline: {
      fr: "Énergie solaire & électricité — installateur certifié ANME",
      ar: "طاقة شمسية وكهرباء — مركّب معتمد من الوكالة الوطنية للتحكم في الطاقة",
      en: "Solar energy & electrical works — ANME-certified installer",
    },
    servicesIntro: {
      fr: "Quatre activités, du pompage solaire aux centrales photovoltaïques.",
      ar: "أربعة أنشطة، من الضخّ الشمسي إلى المحطات الكهروضوئية.",
      en: "Four activities, from solar pumping to utility-scale PV plants.",
    },
    monogram: "GT",
    logoFile: "public/apple-icon.png",
    // Empty = the default palette in globals.css (solar green + sun gold).
    theme: { primary: null, accent: null },
    email: "growingtechnologies88@gmail.com",
    phone: "+216 41 716 017",
    whatsapp: "+216 41 716 017",
    telegram: "@Slah_Smichi",
    ...sbeitla,
    socials: { facebook: "", instagram: "", linkedin: "" },
    /** Headline stats for the home "stats band" (devplan §7). */
    stats: [
      {
        value: "150+",
        label: { fr: "Installations réalisées", ar: "تركيبات منجزة", en: "Installations completed" },
      },
      {
        value: "2 MWc",
        label: { fr: "Puissance installée", ar: "قدرة مركّبة", en: "Power installed" },
      },
      {
        value: "6",
        label: { fr: "Régions couvertes", ar: "ولايات مغطّاة", en: "Regions covered" },
      },
      {
        value: "ANME",
        label: { fr: "Installateur certifié", ar: "مركّب معتمد", en: "Certified installer" },
      },
    ],
  },
  {
    key: "hikview",
    isDefault: false,
    companyName: "Hikview Engineering",
    legalName: "Hikview Engineering SARL",
    matriculeFiscal: "1667878K",
    certification: "",
    businessType: "ProfessionalService",
    tagline: {
      fr: "Sécurité électronique, réseaux & solutions technologiques",
      ar: "الأمن الإلكتروني، الشبكات والحلول التكنولوجية",
      en: "Electronic security, networks & technology solutions",
    },
    servicesIntro: {
      fr: "Six domaines d'expertise, de la sécurité électronique aux projets publics.",
      ar: "ستة مجالات خبرة، من الأمن الإلكتروني إلى المشاريع العمومية.",
      en: "Six areas of expertise, from electronic security to public-sector projects.",
    },
    monogram: "HE",
    // Blue + cyan (plan §3.2).
    theme: { primary: "#1f6fd1", accent: "#06b6d4" },
    email: "contact@hikview.tn",
    phone: "+216 41 716 017",
    whatsapp: "",
    telegram: "",
    ...sbeitla,
    socials: { facebook: "", instagram: "", linkedin: "" },
    stats: [],
  },
  {
    // The group's own site (plan §3.3): plain localhost in development, its own
    // domain once decided. Not the default site: unknown domains keep showing Growing.
    key: "group",
    isDefault: false,
    companyName: "Hikview × Growing",
    legalName: "Groupe Hikview & Growing",
    matriculeFiscal: "", // not a legal entity: each company's is in the group footer
    certification: "",
    businessType: "LocalBusiness",
    tagline: {
      fr: "Sécurité électronique, réseaux et énergie solaire",
      ar: "الأمن الإلكتروني والشبكات والطاقة الشمسية",
      en: "Electronic security, networks and solar energy",
    },
    servicesIntro: {
      fr: "Les services de nos deux sociétés.",
      ar: "خدمات شركتينا.",
      en: "The services of our two companies.",
    },
    monogram: "HG",
    // Hikview blue × Growing green (plan §3.2: "a combined gradient").
    theme: { primary: "#2563eb", accent: "#16a34a" },
    email: "growingtechnologies88@gmail.com", // TODO: group contact email (plan §9)
    phone: "+216 41 716 017", // TODO: group phone (plan §9)
    whatsapp: "",
    telegram: "",
    ...sbeitla,
    socials: { facebook: "", instagram: "", linkedin: "" },
    stats: [
      { value: "2", label: { fr: "Sociétés du groupe", ar: "شركات المجموعة", en: "Group companies" } },
      { value: "10", label: { fr: "Domaines d'expertise", ar: "مجالات الخبرة", en: "Fields of expertise" } },
      { value: "48 h", label: { fr: "Réponse aux demandes de devis", ar: "للردّ على طلبات التسعيرة", en: "Reply to quote requests" } },
      { value: "ANME", label: { fr: "Installateur solaire certifié", ar: "مركّب شمسي معتمد", en: "Certified solar installer" } },
    ],
    logoSubline: { fr: "Groupe", ar: "المجموعة", en: "Group" },
    nav: [
      { href: "/groupe", labelKey: "group" },
      { href: "/#filiales", labelKey: "companies" },
      { href: "/#services", labelKey: "services" },
      { href: "/#references", labelKey: "references" },
      { href: "/#contact", labelKey: "contact" },
    ],
    footerLinks: [
      { href: "/groupe", labelKey: "group" },
      { href: "/devis", labelKey: "devis" },
      { href: "/contact", labelKey: "contact" },
    ],
  },
];
