/**
 * LEGACY: the typed quote form used before the admin form builder (Phase 5a).
 * Still used to display and notify requests made with it (activity + typed
 * groups, no form snapshot), and for the contact summary.
 *
 * Field catalogue of the devis form (devplan §6). Drives:
 *  - step 2 rendering (which inputs per activity, units, tooltips),
 *  - the step 4 review summary (in the visitor's language),
 *  - the team email / Telegram summary (in French).
 * Pure data + pure functions: safe for client and server.
 */
import { t3 } from "../../cms/labels";
import type { Locale } from "../../i18n/config";
import {
  activityOptions,
  contactChannelOptions,
  governorateOptions,
  labelOf,
  phaseOptions,
  propertyTypeOptions,
  roofTypeOptions,
  siteTypeOptions,
  technicalGroupOf,
  waterSourceOptions,
  type Activity,
  type LabeledOption,
  type TechnicalGroup,
} from "./options";

type T3 = ReturnType<typeof t3>;

export interface TechnicalField {
  name: string;
  kind: "number" | "select" | "textarea" | "checkbox";
  label: T3;
  unit?: T3;
  options?: readonly LabeledOption[];
  /** Tooltip explaining a technical term (HMT, autonomy…). */
  help?: T3;
  /** Shown with a "*" — enforced by the schema's per-activity rules. */
  required?: boolean;
  /** Numeric input hints. */
  step?: number;
}

const kwh = t3("kWh", "kWh", "ك.و.س");

export const technicalFields: Record<TechnicalGroup, TechnicalField[]> = {
  raccorde: [
    {
      name: "monthlyBillTnd",
      kind: "number",
      label: t3("Facture STEG mensuelle", "Monthly STEG bill", "فاتورة الستاغ الشهرية"),
      unit: t3("TND", "TND", "د.ت"),
      help: t3(
        "Montant moyen de votre facture STEG par mois. Indiquez la facture OU la consommation.",
        "Average amount of your monthly STEG bill. Give the bill OR the consumption.",
        "المعدّل الشهري لفاتورة الستاغ. أدخل الفاتورة أو الاستهلاك.",
      ),
      required: true,
    },
    {
      name: "monthlyConsumptionKwh",
      kind: "number",
      label: t3("ou consommation mensuelle", "or monthly consumption", "أو الاستهلاك الشهري"),
      unit: kwh,
      help: t3(
        "Indiquée sur votre facture STEG (en kWh).",
        "Shown on your STEG bill (in kWh).",
        "مذكور في فاتورة الستاغ (بالكيلوواط ساعة).",
      ),
    },
    {
      name: "propertyType",
      kind: "select",
      label: t3("Type de bâtiment", "Property type", "نوع المبنى"),
      options: propertyTypeOptions,
    },
    { name: "roofType", kind: "select", label: t3("Type de toiture", "Roof type", "نوع السطح"), options: roofTypeOptions },
    {
      name: "roofSurfaceM2",
      kind: "number",
      label: t3("Surface disponible", "Available area", "المساحة المتاحة"),
      unit: t3("m²", "m²", "م²"),
      help: t3(
        "Surface de toit ou de terrain libre et ensoleillée. Comptez ≈ 5 à 6 m² par kWc.",
        "Free, sunny roof or ground area. Allow ≈ 5–6 m² per kWp.",
        "مساحة السطح أو الأرض الشاغرة والمشمسة. احتسب ≈ 5 إلى 6 م² لكل كيلوواط ذروة.",
      ),
    },
    {
      name: "phase",
      kind: "select",
      label: t3("Raccordement STEG", "STEG supply", "نوع الربط بالستاغ"),
      options: phaseOptions,
      help: t3(
        "Monophasé : habitations courantes. Triphasé : gros consommateurs, ateliers, agriculture. Indiqué sur votre compteur/facture.",
        "Single-phase: typical homes. Three-phase: large consumers, workshops, farms. Shown on your meter/bill.",
        "أحادي الطور: المساكن العادية. ثلاثي الطور: كبار المستهلكين والورشات والفلاحة. مذكور على العدّاد أو الفاتورة.",
      ),
    },
  ],
  pompage: [
    {
      name: "waterSource",
      kind: "select",
      label: t3("Source d'eau", "Water source", "مصدر المياه"),
      options: waterSourceOptions,
      required: true,
    },
    {
      name: "flowM3PerDay",
      kind: "number",
      label: t3("Besoin en eau", "Water needed", "الحاجة إلى المياه"),
      unit: t3("m³/jour", "m³/day", "م³/يوم"),
      help: t3(
        "Volume d'eau à pomper par jour (irrigation, abreuvement…). 1 m³ = 1 000 litres.",
        "Volume of water to pump per day (irrigation, livestock…). 1 m³ = 1,000 litres.",
        "كمية المياه اللازم ضخّها يومياً (ريّ، سقي الماشية…). 1 م³ = 1000 لتر.",
      ),
      required: true,
    },
    {
      name: "depthM",
      kind: "number",
      label: t3("Profondeur du puits/forage", "Well/borehole depth", "عمق البئر/الحفر"),
      unit: t3("m", "m", "م"),
    },
    {
      name: "headM",
      kind: "number",
      label: t3("Hauteur manométrique (HMT)", "Total dynamic head (TDH)", "الارتفاع المانومتري الكلي"),
      unit: t3("m", "m", "م"),
      help: t3(
        "HMT = hauteur totale à vaincre : profondeur du niveau d'eau + hauteur jusqu'au réservoir + pertes dans les tuyaux. Si vous ne savez pas, laissez vide.",
        "TDH = total height to overcome: water level depth + height to the tank + pipe losses. Leave empty if unsure.",
        "الارتفاع المانومتري = عمق مستوى الماء + الارتفاع حتى الخزان + ضياع الأنابيب. اتركه فارغاً إن لم تكن متأكداً.",
      ),
    },
    {
      name: "existingPumpCv",
      kind: "number",
      label: t3("Pompe existante", "Existing pump", "المضخة الحالية"),
      unit: t3("CV", "HP", "حصان"),
      help: t3(
        "Puissance de la pompe actuelle (en chevaux), si vous en avez une.",
        "Power of your current pump (horsepower), if any.",
        "قدرة المضخة الحالية (بالحصان) إن وُجدت.",
      ),
    },
  ],
  isole: [
    {
      name: "dailyConsumptionKwh",
      kind: "number",
      label: t3("Consommation journalière", "Daily consumption", "الاستهلاك اليومي"),
      unit: t3("kWh/jour", "kWh/day", "ك.و.س/يوم"),
      help: t3(
        "Énergie utilisée par jour. Exemple : 10 lampes (100 W) 5 h + réfrigérateur ≈ 2,5 kWh/jour.",
        "Energy used per day. Example: 10 lamps (100 W) for 5 h + a fridge ≈ 2.5 kWh/day.",
        "الطاقة المستعملة يومياً. مثال: 10 مصابيح (100 واط) لمدة 5 ساعات + ثلاجة ≈ 2.5 ك.و.س/يوم.",
      ),
      required: true,
      step: 0.1,
    },
    {
      name: "autonomyDays",
      kind: "number",
      label: t3("Jours d'autonomie", "Days of autonomy", "أيام الاستقلالية"),
      unit: t3("jours", "days", "أيام"),
      help: t3(
        "Nombre de jours sans soleil que les batteries doivent couvrir (souvent 1 à 3).",
        "Number of sunless days the batteries must cover (often 1–3).",
        "عدد الأيام بدون شمس التي يجب أن تغطيها البطاريات (غالباً من 1 إلى 3).",
      ),
    },
    { name: "hasGenset", kind: "checkbox", label: t3("J'ai déjà un groupe électrogène", "I already have a generator", "لديّ مولّد كهربائي") },
    {
      name: "criticalLoads",
      kind: "textarea",
      label: t3("Charges critiques", "Critical loads", "الأحمال الحرجة"),
      help: t3(
        "Équipements qui ne doivent jamais s'arrêter (pompe, chambre froide, relais télécom…).",
        "Equipment that must never stop (pump, cold room, telecom relay…).",
        "تجهيزات يجب ألا تتوقف أبداً (مضخة، غرفة تبريد، محطة اتصالات…).",
      ),
    },
  ],
  electrical: [
    {
      name: "workNature",
      kind: "textarea",
      label: t3("Nature des travaux", "Nature of the work", "طبيعة الأشغال"),
      help: t3(
        "Ex. : tableau électrique neuf, mise aux normes, poste de transformation 250 kVA…",
        "E.g. new switchboard, code compliance, 250 kVA transformer substation…",
        "مثال: لوحة كهربائية جديدة، مطابقة للمعايير، محطة تحويل 250 ك.ف.أ…",
      ),
      required: true,
    },
    { name: "siteType", kind: "select", label: t3("Type de site", "Site type", "نوع الموقع"), options: siteTypeOptions },
    {
      name: "indicativePowerKva",
      kind: "number",
      label: t3("Puissance indicative", "Indicative power", "القدرة التقديرية"),
      unit: t3("kVA", "kVA", "ك.ف.أ"),
      help: t3(
        "Puissance souscrite ou estimée. Laissez vide si vous ne savez pas.",
        "Subscribed or estimated power. Leave empty if unsure.",
        "القدرة المشترَكة أو التقديرية. اتركها فارغة إن لم تكن متأكداً.",
      ),
    },
    {
      name: "existingInstallationNotes",
      kind: "textarea",
      label: t3("Installation existante", "Existing installation", "التركيبة الحالية"),
    },
  ],
};

export const contactLabels = {
  fullName: t3("Nom complet", "Full name", "الاسم الكامل"),
  phone: t3("Téléphone", "Phone", "الهاتف"),
  email: t3("E-mail", "Email", "البريد الإلكتروني"),
  region: t3("Gouvernorat", "Governorate", "الولاية"),
  address: t3("Adresse du site", "Site address", "عنوان الموقع"),
  preferredChannel: t3("Canal préféré", "Preferred channel", "وسيلة الاتصال المفضّلة"),
  activity: t3("Activité", "Activity", "النشاط"),
} as const;

// --- Summary -------------------------------------------------------------------

export interface SummaryRow {
  label: string;
  value: string;
}

export interface LeadLike {
  activity: Activity;
  fullName: string;
  phone: string;
  email?: string | null;
  region: string;
  address?: string | null;
  preferredChannel?: string | null;
  raccorde?: Record<string, unknown> | null;
  pompage?: Record<string, unknown> | null;
  isole?: Record<string, unknown> | null;
  electrical?: Record<string, unknown> | null;
}

const yesNo = { fr: ["Oui", "Non"], en: ["Yes", "No"], ar: ["نعم", "لا"] } as const;

function formatValue(field: TechnicalField, raw: unknown, locale: Locale): string | null {
  if (raw === undefined || raw === null || raw === "") return null;
  switch (field.kind) {
    case "checkbox":
      return raw === true ? yesNo[locale][0] : null;
    case "select":
      return labelOf(field.options ?? [], String(raw), locale) || String(raw);
    case "number": {
      const n = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isFinite(n)) return null;
      const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-TN" : `${locale}-TN`).format(n);
      return field.unit ? `${formatted} ${field.unit[locale]}` : formatted;
    }
    default:
      return String(raw).trim() || null;
  }
}

/** Technical rows for the lead's activity (empty values omitted). */
export function technicalSummary(lead: LeadLike, locale: Locale): SummaryRow[] {
  const group = technicalGroupOf[lead.activity];
  const values = lead[group] ?? {};
  return technicalFields[group].flatMap((field) => {
    const value = formatValue(field, values[field.name], locale);
    return value === null ? [] : [{ label: field.label[locale], value }];
  });
}

/** Contact rows (empty values omitted). */
export function contactSummary(
  lead: Pick<LeadLike, "fullName" | "phone" | "email" | "region" | "address" | "preferredChannel">,
  locale: Locale,
): SummaryRow[] {
  const rows: [keyof typeof contactLabels, string | null | undefined][] = [
    ["fullName", lead.fullName],
    ["phone", lead.phone],
    ["email", lead.email],
    ["region", labelOf(governorateOptions, lead.region, locale)],
    ["address", lead.address],
    ["preferredChannel", labelOf(contactChannelOptions, lead.preferredChannel, locale)],
  ];
  return rows.flatMap(([key, value]) => (value ? [{ label: contactLabels[key][locale], value }] : []));
}

export function activityLabel(activity: Activity, locale: Locale): string {
  return labelOf(activityOptions, activity, locale);
}
