/**
 * Company documents for tenders (plan Phase 6): attestations, certificates and
 * datasheets each company keeps up to date in the admin (Documents
 * administratifs), listed on its public /documents page. Dependency-free:
 * used by the collection, the public page, the expiry alerts and unit tests.
 */
import { t3 } from "../cms/labels";

export const documentTypes = [
  { value: "attestation-fiscale", label: t3("Attestation de situation fiscale", "Tax clearance certificate", "شهادة في الوضعية الجبائية") },
  { value: "cnss", label: t3("Attestation CNSS", "Social security (CNSS) certificate", "شهادة الصندوق الوطني للضمان الاجتماعي") },
  { value: "rne", label: t3("Extrait du RNE", "Business register (RNE) extract", "مضمون من السجل الوطني للمؤسسات") },
  { value: "certificat", label: t3("Certificats & agréments", "Certificates & approvals", "الشهادات والمصادقات") },
  { value: "bonne-execution", label: t3("Attestations de bonne exécution", "Certificates of satisfactory completion", "شهادات حسن التنفيذ") },
  { value: "fiche-technique", label: t3("Fiches techniques", "Datasheets", "البطاقات الفنية") },
  { value: "autre", label: t3("Autres documents", "Other documents", "وثائق أخرى") },
] as const;
export type DocumentType = (typeof documentTypes)[number]["value"];

export const documentVisibilities = [
  { value: "public", label: t3("Public : téléchargeable", "Public: downloadable", "عمومي: قابل للتحميل") },
  { value: "on-request", label: t3("Listé, envoyé sur demande", "Listed, sent on request", "مُدرج، يُرسل عند الطلب") },
  { value: "internal", label: t3("Interne (équipe uniquement)", "Internal (team only)", "داخلي (للفريق فقط)") },
] as const;
export type DocumentVisibility = (typeof documentVisibilities)[number]["value"];

/** Warn this many days before a document expires. */
export const EXPIRY_WARNING_DAYS = 30;
export const EXPIRY_URGENT_DAYS = 7;

/** How close a document is to expiring, from least to most urgent. */
export const expiryLevels = ["valid", "soon", "urgent", "expired"] as const;
export type ExpiryLevel = (typeof expiryLevels)[number];

const DAY = 24 * 60 * 60 * 1000;

/** The calendar day (Tunis) of a date, as a UTC midnight timestamp. */
function tunisDay(date: Date): number {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Tunis" }).format(date).split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!);
}

/** Whole days left until `validUntil` (0 = expires today, negative = expired). Null when it never expires. */
export function daysLeft(validUntil: string | null | undefined, now = new Date()): number | null {
  if (!validUntil) return null;
  const end = new Date(validUntil);
  if (Number.isNaN(end.getTime())) return null;
  return Math.round((tunisDay(end) - tunisDay(now)) / DAY);
}

/** A document is still valid on its last day; it is expired the day after. */
export function expiryLevel(validUntil: string | null | undefined, now = new Date()): ExpiryLevel {
  const days = daysLeft(validUntil, now);
  if (days === null || days > EXPIRY_WARNING_DAYS) return "valid";
  if (days < 0) return "expired";
  return days <= EXPIRY_URGENT_DAYS ? "urgent" : "soon";
}

export const isExpired = (validUntil: string | null | undefined, now = new Date()) =>
  expiryLevel(validUntil, now) === "expired";

/**
 * Whether the team should be alerted now: the document reached a more urgent
 * level than the one it was last alerted for (Documents → alertLevel).
 */
export function needsAlert(level: ExpiryLevel, alerted: string | null | undefined): boolean {
  if (level === "valid") return false;
  const last = expiryLevels.indexOf((alerted ?? "valid") as ExpiryLevel);
  return expiryLevels.indexOf(level) > Math.max(last, 0);
}

/**
 * The first instant of today in Tunis (UTC+1, no daylight saving since 2009):
 * a document whose validity date is today or later is still valid.
 */
export function startOfTunisDay(now = new Date()): Date {
  return new Date(tunisDay(now) - 60 * 60 * 1000);
}
