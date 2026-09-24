/**
 * Devis validation — shared by the form (per-step, on the client) and the
 * server action (full schema, authoritative). Error messages are translation
 * keys (`devis.errors.<key>` in messages/*.json), never user-facing text.
 */
import { z } from "zod";
import {
  activityOptions,
  contactChannelOptions,
  governorateOptions,
  phaseOptions,
  propertyTypeOptions,
  roofTypeOptions,
  siteTypeOptions,
  technicalGroupOf,
  valuesOf,
  waterSourceOptions,
  type Activity,
} from "./options";
import { isValidTnPhone, normalizeTnPhone, toAsciiDigits } from "./phone";

export const devisErrorKeys = [
  "required",
  "chooseActivity",
  "invalidPhone",
  "invalidEmail",
  "number",
  "tooLarge",
  "tooLong",
  "invalidOption",
  "consent",
  "billOrConsumption",
  "describeWork",
] as const;
export type DevisErrorKey = (typeof devisErrorKeys)[number];

// --- Building blocks -------------------------------------------------------------

const blankToUndefined = (v: unknown) =>
  v === null || (typeof v === "string" && v.trim() === "") ? undefined : v;

/** Optional number from a text input: accepts Arabic-Indic digits and "12,5". */
const optionalNumber = (max: number) =>
  z.preprocess(
    (v) => {
      const value = blankToUndefined(v);
      if (typeof value !== "string") return value;
      const n = Number(toAsciiDigits(value).trim().replace(",", "."));
      return Number.isFinite(n) ? n : value; // keep invalid text → "number" error
    },
    z
      .number({ invalid_type_error: "number" })
      .min(0, "number")
      .max(max, "tooLarge")
      .optional(),
  );

const optionalEnum = <V extends string>(values: [V, ...V[]]) =>
  z.preprocess(blankToUndefined, z.enum(values, { errorMap: () => ({ message: "invalidOption" }) }).optional());

const optionalText = (max: number) =>
  z.preprocess(blankToUndefined, z.string().trim().max(max, "tooLong").optional());

// --- Fields ---------------------------------------------------------------------

const activity = z.enum(valuesOf(activityOptions), { errorMap: () => ({ message: "chooseActivity" }) });

/** Step 2 groups — keys mirror the DevisRequests collection groups. */
const technicalShape = {
  raccorde: z
    .object({
      monthlyBillTnd: optionalNumber(1_000_000),
      monthlyConsumptionKwh: optionalNumber(10_000_000),
      propertyType: optionalEnum(valuesOf(propertyTypeOptions)),
      roofType: optionalEnum(valuesOf(roofTypeOptions)),
      roofSurfaceM2: optionalNumber(1_000_000),
      phase: optionalEnum(valuesOf(phaseOptions)),
    })
    .optional(),
  pompage: z
    .object({
      waterSource: optionalEnum(valuesOf(waterSourceOptions)),
      flowM3PerDay: optionalNumber(100_000),
      depthM: optionalNumber(3_000),
      headM: optionalNumber(3_000),
      existingPumpCv: optionalNumber(10_000),
    })
    .optional(),
  isole: z
    .object({
      dailyConsumptionKwh: optionalNumber(100_000),
      autonomyDays: optionalNumber(30),
      hasGenset: z.boolean().optional(),
      criticalLoads: optionalText(1_000),
    })
    .optional(),
  electrical: z
    .object({
      workNature: optionalText(2_000),
      siteType: optionalEnum(valuesOf(siteTypeOptions)),
      indicativePowerKva: optionalNumber(100_000),
      existingInstallationNotes: optionalText(2_000),
    })
    .optional(),
};

const contactShape = {
  fullName: z.string({ required_error: "required" }).trim().min(2, "required").max(120, "tooLong"),
  phone: z
    .string({ required_error: "required" })
    .trim()
    .min(1, "required")
    .refine(isValidTnPhone, "invalidPhone")
    .transform(normalizeTnPhone),
  email: z.preprocess(
    blankToUndefined,
    z.string().trim().toLowerCase().max(200, "tooLong").email("invalidEmail").optional(),
  ),
  region: z.enum(valuesOf(governorateOptions), { errorMap: () => ({ message: "required" }) }),
  address: optionalText(500),
  preferredChannel: z.preprocess(
    blankToUndefined,
    z.enum(valuesOf(contactChannelOptions), { errorMap: () => ({ message: "invalidOption" }) }).default("call"),
  ),
};

const consent = z.literal(true, { errorMap: () => ({ message: "consent" }) });

// --- Per-activity requirements -----------------------------------------------------

type TechnicalValues = { activity: Activity } & {
  [K in keyof typeof technicalShape]?: z.output<(typeof technicalShape)[K]>;
};

function refineTechnical(data: TechnicalValues, ctx: z.RefinementCtx) {
  const fail = (path: string[], message: DevisErrorKey) => ctx.addIssue({ code: "custom", path, message });
  switch (data.activity) {
    case "raccorde":
      if (data.raccorde?.monthlyBillTnd === undefined && data.raccorde?.monthlyConsumptionKwh === undefined) {
        fail(["raccorde", "monthlyBillTnd"], "billOrConsumption");
      }
      break;
    case "pompage":
      if (!data.pompage?.waterSource) fail(["pompage", "waterSource"], "required");
      if (data.pompage?.flowM3PerDay === undefined) fail(["pompage", "flowM3PerDay"], "required");
      break;
    case "isole":
      if (data.isole?.dailyConsumptionKwh === undefined) fail(["isole", "dailyConsumptionKwh"], "required");
      break;
    case "bt":
    case "mt":
      if ((data.electrical?.workNature ?? "").length < 10) fail(["electrical", "workNature"], "describeWork");
      break;
  }
}

// --- Schemas ----------------------------------------------------------------------

/** One schema per form step (index 0–3), validated before moving on. */
export const stepSchemas = [
  z.object({ activity }),
  z.object({ activity, ...technicalShape }).superRefine(refineTechnical),
  z.object(contactShape),
  z.object({ consent }),
] as const;

export const DEVIS_STEPS = stepSchemas.length;

/** Full schema (server). Drops the technical groups of other activities. */
export const devisSchema = z
  .object({ activity, ...technicalShape, ...contactShape, consent })
  .superRefine(refineTechnical)
  .transform((data) => {
    const group = technicalGroupOf[data.activity];
    const { raccorde, pompage, isole, electrical, ...rest } = data;
    const groups = { raccorde, pompage, isole, electrical };
    return { ...rest, [group]: groups[group] ?? {} } as typeof rest & Partial<typeof groups>;
  });

export type DevisData = z.output<typeof devisSchema>;

/** Map Zod issues to `{ "pompage.depthM": "number" }` (first issue per field). */
export function fieldErrorsOf(error: z.ZodError): Record<string, DevisErrorKey> {
  const out: Record<string, DevisErrorKey> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "form";
    if (out[path]) continue;
    out[path] = (devisErrorKeys as readonly string[]).includes(issue.message)
      ? (issue.message as DevisErrorKey)
      : "required";
  }
  return out;
}

// --- Form values ----------------------------------------------------------------

/** Raw form state (text inputs are strings until parsed by the schema). */
export interface DevisFormValues {
  activity: Activity | "";
  raccorde: Record<"monthlyBillTnd" | "monthlyConsumptionKwh" | "propertyType" | "roofType" | "roofSurfaceM2" | "phase", string>;
  pompage: Record<"waterSource" | "flowM3PerDay" | "depthM" | "headM" | "existingPumpCv", string>;
  isole: { dailyConsumptionKwh: string; autonomyDays: string; hasGenset: boolean; criticalLoads: string };
  electrical: Record<"workNature" | "siteType" | "indicativePowerKva" | "existingInstallationNotes", string>;
  fullName: string;
  phone: string;
  email: string;
  region: string;
  address: string;
  preferredChannel: string;
  consent: boolean;
}

export const emptyDevisValues: DevisFormValues = {
  activity: "",
  raccorde: { monthlyBillTnd: "", monthlyConsumptionKwh: "", propertyType: "", roofType: "", roofSurfaceM2: "", phase: "" },
  pompage: { waterSource: "", flowM3PerDay: "", depthM: "", headM: "", existingPumpCv: "" },
  isole: { dailyConsumptionKwh: "", autonomyDays: "", hasGenset: false, criticalLoads: "" },
  electrical: { workNature: "", siteType: "", indicativePowerKva: "", existingInstallationNotes: "" },
  fullName: "",
  phone: "",
  email: "",
  region: "",
  address: "",
  preferredChannel: "call",
  consent: false,
};
