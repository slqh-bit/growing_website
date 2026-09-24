import type { Localized } from "./types";

/**
 * Site-wide settings — mirrors the Payload `SiteSettings` global (devplan §4.8).
 * Real matricule fiscal / coordinates to be confirmed with the owner before launch.
 */
export const siteSettings = {
  companyName: "Growing Technologies",
  legalName: "Growing Technologies",
  matriculeFiscal: "0000000/X/X/M/000", // TODO: confirm real matricule fiscal
  certification: "ANME" as const,
  email: "slahchmissi@gmail.com",
  phone: "+216 00 000 000", // TODO: confirm real phone
  whatsapp: "+216 00 000 000", // TODO: confirm
  telegram: "@Slah_Smichi",
  address: {
    fr: "Rue Marroc, Sbeitla 1250, Kasserine, Tunisie",
    ar: "نهج المغرب، سبيطلة 1250، القصرين، تونس",
    en: "Rue Marroc, Sbeitla 1250, Kasserine, Tunisia",
  } satisfies Localized,
  city: { fr: "Sbeitla", ar: "سبيطلة", en: "Sbeitla" } satisfies Localized,
  // Approximate coordinates of Sbeitla (used for the contact map).
  coords: { lat: 35.2372, lng: 9.1214 },
  socials: {
    facebook: "",
    instagram: "",
    linkedin: "",
  },
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
  ] satisfies { value: string; label: Localized }[],
} as const;

export type SiteSettings = typeof siteSettings;
