/**
 * Devis validation — shared by the form (per-step, on the client) and the
 * server action (full schema, authoritative). The technical step comes from
 * the chosen service's form definition (./form-def). Error messages are
 * translation keys (`devis.errors.<key>` in messages/*.json), never text.
 */
import { z } from "zod";
import { contactChannelOptions, governorateOptions, valuesOf } from "./options";
import { answersSchema, type FormDef } from "./form-def";
import { isValidTnPhone, normalizeTnPhone } from "./phone";

export const devisErrorKeys = [
  "required",
  "chooseActivity",
  "invalidPhone",
  "invalidEmail",
  "number",
  "tooSmall",
  "tooLarge",
  "tooLong",
  "invalidOption",
  "invalidDate",
  "requireOne",
  "consent",
] as const;
export type DevisErrorKey = (typeof devisErrorKeys)[number];

const blankToUndefined = (v: unknown) =>
  v === null || (typeof v === "string" && v.trim() === "") ? undefined : v;

const optionalText = (max: number) =>
  z.preprocess(blankToUndefined, z.string().trim().max(max, "tooLong").optional());

// --- Fields ---------------------------------------------------------------------

/** The service chosen at step 1 (its id, as a string), among the site's quote services. */
const serviceOf = (serviceIds: readonly string[]) =>
  z.string({ required_error: "chooseActivity" }).refine((id) => serviceIds.includes(id), "chooseActivity");

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

// --- Schemas ----------------------------------------------------------------------

/** What the form needs to know about each service it offers. */
export interface ServiceForm {
  id: string;
  form: FormDef;
}

export const DEVIS_STEPS = 4;

/**
 * The schema of one form step (index 0–3), validated before moving on. Step 2
 * depends on the service chosen at step 1.
 */
export function stepSchema(step: number, services: readonly ServiceForm[], serviceId: string) {
  const ids = services.map((s) => s.id);
  const form = services.find((s) => s.id === serviceId)?.form ?? { questions: [] };
  switch (step) {
    case 0:
      return z.object({ service: serviceOf(ids) });
    case 1:
      return z.object({ answers: answersSchema(form) });
    case 2:
      return z.object(contactShape);
    default:
      return z.object({ consent });
  }
}

/** Full schema (server) for a request on the service whose form is `form`. */
export function devisSchema(serviceIds: readonly string[], form: FormDef) {
  return z.object({ service: serviceOf(serviceIds), answers: answersSchema(form), ...contactShape, consent });
}

export type DevisData = z.output<ReturnType<typeof devisSchema>>;

/** Map Zod issues to `{ "answers.depthM": "number" }` (first issue per field). */
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
  service: string;
  answers: Record<string, string | boolean | string[]>;
  fullName: string;
  phone: string;
  email: string;
  region: string;
  address: string;
  preferredChannel: string;
  consent: boolean;
}

export const emptyDevisValues: DevisFormValues = {
  service: "",
  answers: {},
  fullName: "",
  phone: "",
  email: "",
  region: "",
  address: "",
  preferredChannel: "call",
  consent: false,
};
