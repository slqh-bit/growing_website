import type { SiteKey } from "../../src/sites/config";
import type { Localized } from "./types";

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
  tagline: Localized;
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
    tagline: {
      fr: "Énergie solaire & électricité — installateur certifié ANME",
      ar: "طاقة شمسية وكهرباء — مركّب معتمد من الوكالة الوطنية للتحكم في الطاقة",
      en: "Solar energy & electrical works — ANME-certified installer",
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
    tagline: {
      fr: "Sécurité électronique, réseaux & solutions technologiques",
      ar: "الأمن الإلكتروني، الشبكات والحلول التكنولوجية",
      en: "Electronic security, networks & technology solutions",
    },
    monogram: "HE",
    // Blue + cyan (plan §3.2).
    theme: { primary: "#1f6fd1", accent: "#06b6d4" },
    email: "slahchmissi@gmail.com", // TODO: Hikview contact email (plan §9)
    phone: "+216 00 000 000", // TODO: Hikview phone (plan §9)
    whatsapp: "",
    telegram: "",
    ...sbeitla,
    socials: { facebook: "", instagram: "", linkedin: "" },
    stats: [],
  },
];
