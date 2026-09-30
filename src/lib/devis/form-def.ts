/**
 * Admin-built quote forms (plan §6): a form definition (Contenu → Formulaires
 * de devis) drives the public form's technical step, its validation (client
 * and server), the review step, the admin view of a request and every
 * notification. Each request keeps a snapshot of the definition it was filled
 * with, so it stays readable after the form changes.
 *
 * Dependency-free apart from Zod: runs in the browser, the server action, the
 * Payload admin and unit tests.
 */
import { z } from "zod";
import type { Locale } from "../../i18n/config";
import { toAsciiDigits } from "./phone";

/** A label in one or several languages (Payload `locale: "all"`), or a plain string. */
export type L10n = Partial<Record<Locale, string | null>> | string | null | undefined;

/** The label in `locale`, else French, else any language available. */
export function pick(value: L10n, locale: Locale): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.fr || Object.values(value).find((v) => v) || "";
}

export const questionTypes = [
  "text",
  "textarea",
  "number",
  "select",
  "radio",
  "multiselect",
  "checkbox",
  "date",
] as const;
export type QuestionType = (typeof questionTypes)[number];

export const choiceTypes: readonly QuestionType[] = ["select", "radio", "multiselect"];

export interface QuestionDef {
  /** Answer key, e.g. "flowM3PerDay". Unique within a form. */
  name: string;
  type: QuestionType;
  label: L10n;
  help?: L10n;
  unit?: L10n;
  required?: boolean | null;
  /** Questions sharing a group: at least one of them must be answered (e.g. bill OR consumption). */
  requiredGroup?: string | null;
  min?: number | null;
  max?: number | null;
  width?: "half" | "full" | null;
  options?: { value: string; label: L10n }[] | null;
  /** Only shown (and validated) when another question has this value. */
  showIf?: { field?: string | null; equals?: string | null } | null;
}

export type AttachmentsMode = "optional" | "required" | "off";

export interface FormDef {
  questions: QuestionDef[];
  /** Files the client may attach after the questions (default: optional, generic label). */
  attachments?: { mode?: AttachmentsMode | null; label?: L10n; help?: L10n } | null;
}

/** Whether (and how) a form asks for files. */
export const attachmentsMode = (def: FormDef): AttachmentsMode => def.attachments?.mode ?? "optional";

/** What a request keeps: the service chosen and the questions as they were. */
export interface FormSnapshot extends FormDef {
  serviceTitle: L10n;
}

export type AnswerValue = string | number | boolean | string[];
export type Answers = Record<string, AnswerValue | null | undefined>;

// --- Structure ---------------------------------------------------------------------

type QuestionRow = {
  name?: string | null;
  options?: { value?: string | null }[] | null;
  showIf?: { field?: string | null } | null;
};

/**
 * The first structural problem of a form's questions (admin validation):
 * keys unique, conditions pointing at an earlier question, choice values unique.
 */
export function questionsProblem(rows: readonly QuestionRow[]): string | null {
  const seen = new Set<string>();
  for (const [i, row] of rows.entries()) {
    const name = row.name ?? "";
    if (seen.has(name)) return `Question ${i + 1}: the key "${name}" is already used in this form.`;
    const condition = row.showIf?.field;
    if (condition && !seen.has(condition)) {
      return `Question ${i + 1}: "Afficher si" must name an earlier question's key (not "${condition}").`;
    }
    seen.add(name);
    const values = (row.options ?? []).map((o) => o.value ?? "");
    if (new Set(values).size !== values.length) return `Question ${i + 1}: two choices have the same value.`;
  }
  return null;
}

// --- Visibility --------------------------------------------------------------------

const isBlank = (v: unknown) =>
  v === undefined ||
  v === null ||
  v === false ||
  (typeof v === "string" && v.trim() === "") ||
  (Array.isArray(v) && v.length === 0);

/** A question is shown when its condition holds and the question it depends on is shown too. */
export function isVisible(
  question: QuestionDef,
  answers: Answers,
  def: FormDef,
  depth = 0,
): boolean {
  const field = question.showIf?.field;
  if (!field || depth > 10) return true;
  const parent = def.questions.find((q) => q.name === field);
  if (parent && !isVisible(parent, answers, def, depth + 1)) return false;
  const value = answers[field];
  const expected = question.showIf?.equals ?? "";
  return Array.isArray(value) ? value.includes(expected) : String(value ?? "") === expected;
}

// --- Validation --------------------------------------------------------------------

const blankToUndefined = (v: unknown) =>
  v === null || (typeof v === "string" && v.trim() === "") ? undefined : v;

function questionSchema(q: QuestionDef): z.ZodTypeAny {
  switch (q.type) {
    case "number": {
      let n = z.number({ invalid_type_error: "number" });
      n = n.min(q.min ?? 0, q.min ? "tooSmall" : "number");
      n = n.max(q.max ?? 1_000_000_000, "tooLarge");
      return z.preprocess((v) => {
        const value = blankToUndefined(v);
        if (typeof value !== "string") return value;
        const parsed = Number(toAsciiDigits(value).trim().replace(/\s/g, "").replace(",", "."));
        return Number.isFinite(parsed) ? parsed : value; // invalid text → "number" error
      }, n.optional());
    }
    case "select":
    case "radio": {
      const values = (q.options ?? []).map((o) => o.value);
      return z.preprocess(
        blankToUndefined,
        z
          .string()
          .refine((v) => values.includes(v), "invalidOption")
          .optional(),
      );
    }
    case "multiselect": {
      const values = (q.options ?? []).map((o) => o.value);
      return z.preprocess(
        (v) => (Array.isArray(v) ? v : isBlank(v) ? [] : [v]),
        z
          .array(z.string().refine((v) => values.includes(v), "invalidOption"))
          .max(values.length, "invalidOption"),
      );
    }
    case "checkbox":
      return z.preprocess((v) => v === true || v === "true" || v === "on", z.boolean());
    case "date":
      return z.preprocess(
        blankToUndefined,
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "invalidDate")
          .optional(),
      );
    case "textarea":
      return z.preprocess(blankToUndefined, z.string().trim().max(2_000, "tooLong").optional());
    default:
      return z.preprocess(blankToUndefined, z.string().trim().max(300, "tooLong").optional());
  }
}

/**
 * Zod schema of a form's answers: types, required questions (when shown), "at
 * least one of" groups. The output keeps only the shown, non-empty answers.
 */
export function answersSchema(def: FormDef) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const q of def.questions) shape[q.name] = questionSchema(q);

  // Hidden questions are ignored altogether (a stale value can't block the form).
  const onlyVisible = (raw: unknown) => {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return raw;
    const answers = raw as Answers;
    return Object.fromEntries(
      def.questions.filter((q) => isVisible(q, answers, def)).map((q) => [q.name, answers[q.name]]),
    );
  };

  return z.preprocess(
    onlyVisible,
    z
      .object(shape)
      .superRefine((data: Answers, ctx) => {
        const groups = new Map<string, QuestionDef[]>();
        for (const q of def.questions) {
          if (!isVisible(q, data, def)) continue;
          if (q.required && isBlank(data[q.name])) {
            ctx.addIssue({ code: "custom", path: [q.name], message: "required" });
          }
          if (q.requiredGroup)
            groups.set(q.requiredGroup, [...(groups.get(q.requiredGroup) ?? []), q]);
        }
        for (const members of groups.values()) {
          if (members.every((q) => isBlank(data[q.name]))) {
            ctx.addIssue({ code: "custom", path: [members[0]!.name], message: "requireOne" });
          }
        }
      })
      .transform((data: Answers) => {
        const out: Record<string, AnswerValue> = {};
        for (const q of def.questions) {
          const value = data[q.name];
          if (isVisible(q, data, def) && !isBlank(value)) out[q.name] = value as AnswerValue;
        }
        return out;
      }),
  );
}

// --- Summaries ---------------------------------------------------------------------

export interface SummaryRow {
  label: string;
  value: string;
}

const yes: Record<Locale, string> = { fr: "Oui", en: "Yes", ar: "نعم" };

function formatAnswer(
  q: QuestionDef,
  raw: AnswerValue | null | undefined,
  locale: Locale,
): string | null {
  if (isBlank(raw)) return null;
  const optionLabel = (v: string) =>
    pick(q.options?.find((o) => o.value === v)?.label, locale) || v;
  switch (q.type) {
    case "checkbox":
      return raw === true ? yes[locale] : null;
    case "select":
    case "radio":
      return optionLabel(String(raw));
    case "multiselect":
      return (Array.isArray(raw) ? raw : [String(raw)]).map(optionLabel).join(", ");
    case "number": {
      const n = typeof raw === "number" ? raw : Number(raw);
      if (!Number.isFinite(n)) return String(raw);
      const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-TN" : `${locale}-TN`).format(n);
      const unit = pick(q.unit, locale);
      return unit ? `${formatted} ${unit}` : formatted;
    }
    case "date": {
      const date = new Date(`${String(raw)}T00:00:00Z`);
      if (Number.isNaN(date.getTime())) return String(raw);
      const tag = { fr: "fr-TN", en: "en-GB", ar: "ar-TN" }[locale]; // en-TN would give 12/31/26
      return new Intl.DateTimeFormat(tag, { dateStyle: "short", timeZone: "UTC" }).format(date);
    }
    default:
      return String(raw).trim() || null;
  }
}

/** Question → answer rows in `locale`, in the form's order (hidden and empty ones omitted). */
export function answersSummary(def: FormDef, answers: Answers, locale: Locale): SummaryRow[] {
  return def.questions.flatMap((q) => {
    if (!isVisible(q, answers, def)) return [];
    const value = formatAnswer(q, answers[q.name], locale);
    return value === null ? [] : [{ label: pick(q.label, locale), value }];
  });
}
