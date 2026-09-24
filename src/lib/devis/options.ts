/**
 * Option lists for the devis (quote request) — single source of truth for the
 * public form (labels per locale), the Zod schema (allowed values) and the
 * Payload DevisRequests collection (admin select options).
 *
 * Dependency-free: imported by client components, the server action and the
 * Payload config (relative imports only, for the Payload CLI).
 */
import { t3 } from "../../cms/labels";

export interface LabeledOption<V extends string = string> {
  value: V;
  label: { fr: string; en: string; ar: string };
}

function option<const V extends string>(value: V, fr: string, en: string, ar: string): LabeledOption<V> {
  return { value, label: t3(fr, en, ar) };
}

/** Values of an option list as a non-empty tuple (for `z.enum`). */
export function valuesOf<V extends string>(options: readonly LabeledOption<V>[]): [V, ...V[]] {
  return options.map((o) => o.value) as [V, ...V[]];
}

/** Label of a value in the given locale ("" when unknown). */
export function labelOf(
  options: readonly LabeledOption[],
  value: string | null | undefined,
  locale: "fr" | "en" | "ar",
): string {
  return options.find((o) => o.value === value)?.label[locale] ?? "";
}

// --- Step 1: activity (devplan §1) -------------------------------------------

export const activityOptions = [
  option("raccorde", "Installation raccordée", "Grid-connected", "تركيب مربوط بالشبكة"),
  option("pompage", "Pompage solaire", "Solar pumping", "الضخّ الشمسي"),
  option("isole", "Site isolé", "Off-grid", "موقع معزول"),
  option("bt", "Basse tension (BT)", "Low voltage (LV)", "الجهد المنخفض"),
  option("mt", "Moyenne tension (MT)", "Medium voltage (MV)", "الجهد المتوسط"),
] as const;
export type Activity = (typeof activityOptions)[number]["value"];

/** Which technical group of the form/collection an activity uses. */
export const technicalGroupOf = {
  raccorde: "raccorde",
  pompage: "pompage",
  isole: "isole",
  bt: "electrical",
  mt: "electrical",
} as const satisfies Record<Activity, string>;
export type TechnicalGroup = (typeof technicalGroupOf)[Activity];

// --- Step 2: technical needs ---------------------------------------------------

export const roofTypeOptions = [
  option("terrasse", "Terrasse béton", "Concrete flat roof", "سطح خرساني"),
  option("tuiles", "Tuiles", "Tiles", "قرميد"),
  option("bac-acier", "Bac acier", "Steel sheet", "صفائح فولاذية"),
  option("sol", "Au sol", "Ground-mounted", "على الأرض"),
] as const;

export const phaseOptions = [
  option("mono", "Monophasé", "Single-phase", "أحادي الطور"),
  option("tri", "Triphasé", "Three-phase", "ثلاثي الطور"),
] as const;

export const propertyTypeOptions = [
  option("residentiel", "Résidentiel", "Residential", "سكني"),
  option("commercial", "Commercial", "Commercial", "تجاري"),
  option("industriel", "Industriel", "Industrial", "صناعي"),
  option("agricole", "Agricole", "Agricultural", "فلاحي"),
] as const;

export const waterSourceOptions = [
  option("puits", "Puits", "Well", "بئر"),
  option("forage", "Forage", "Borehole", "حفر"),
  option("surface", "Surface (bassin, oued)", "Surface (basin, river)", "سطحي (حوض، وادي)"),
] as const;

export const siteTypeOptions = [
  option("residentiel", "Résidentiel", "Residential", "سكني"),
  option("tertiaire", "Tertiaire", "Commercial", "خدمي"),
  option("industriel", "Industriel", "Industrial", "صناعي"),
  option("agricole", "Agricole", "Agricultural", "فلاحي"),
  option("public", "Public", "Public", "عمومي"),
] as const;

// --- Step 3: site & contact ----------------------------------------------------

export const contactChannelOptions = [
  option("call", "Appel téléphonique", "Phone call", "مكالمة هاتفية"),
  option("whatsapp", "WhatsApp", "WhatsApp", "واتساب"),
  option("telegram", "Telegram", "Telegram", "تيليغرام"),
] as const;

/** The 24 Tunisian governorates. */
export const governorateOptions = [
  option("ariana", "Ariana", "Ariana", "أريانة"),
  option("beja", "Béja", "Béja", "باجة"),
  option("ben-arous", "Ben Arous", "Ben Arous", "بن عروس"),
  option("bizerte", "Bizerte", "Bizerte", "بنزرت"),
  option("gabes", "Gabès", "Gabès", "قابس"),
  option("gafsa", "Gafsa", "Gafsa", "قفصة"),
  option("jendouba", "Jendouba", "Jendouba", "جندوبة"),
  option("kairouan", "Kairouan", "Kairouan", "القيروان"),
  option("kasserine", "Kasserine", "Kasserine", "القصرين"),
  option("kebili", "Kébili", "Kébili", "قبلي"),
  option("kef", "Le Kef", "Le Kef", "الكاف"),
  option("mahdia", "Mahdia", "Mahdia", "المهدية"),
  option("manouba", "La Manouba", "La Manouba", "منوبة"),
  option("medenine", "Médenine", "Médenine", "مدنين"),
  option("monastir", "Monastir", "Monastir", "المنستير"),
  option("nabeul", "Nabeul", "Nabeul", "نابل"),
  option("sfax", "Sfax", "Sfax", "صفاقس"),
  option("sidi-bouzid", "Sidi Bouzid", "Sidi Bouzid", "سيدي بوزيد"),
  option("siliana", "Siliana", "Siliana", "سليانة"),
  option("sousse", "Sousse", "Sousse", "سوسة"),
  option("tataouine", "Tataouine", "Tataouine", "تطاوين"),
  option("tozeur", "Tozeur", "Tozeur", "توزر"),
  option("tunis", "Tunis", "Tunis", "تونس"),
  option("zaghouan", "Zaghouan", "Zaghouan", "زغوان"),
] as const;
