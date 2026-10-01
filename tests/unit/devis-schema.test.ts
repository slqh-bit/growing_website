import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { devisSchema, emptyDevisValues, fieldErrorsOf, stepSchema, type ServiceForm } from "../../src/lib/devis/schema";
import { answersSchema, answersSummary, isVisible, type FormDef } from "../../src/lib/devis/form-def";
import { contactSummary } from "../../src/lib/devis/fields";
import { devisForms } from "../../scripts/seed-data/devis-forms";

/** Growing's seeded forms, as the server reads them (labels in every language). */
const formOf = (service: string): FormDef => ({
  questions: devisForms.find((f) => f.services.includes(service))!.questions,
});
const raccorde = formOf("installation-raccordee");
const pompage = formOf("pompage-solaire");
const isole = formOf("site-isole");
const centrale = formOf("centrale-photovoltaique");

const services: ServiceForm[] = [
  { id: "1", form: raccorde },
  { id: "2", form: pompage },
  { id: "3", form: isole },
  { id: "4", form: centrale },
];

const contact = {
  ...emptyDevisValues,
  fullName: "Ali Ben Salah",
  phone: "98 123 456",
  region: "kasserine",
  consent: true,
};
const errorsOf = (result: { success: boolean; error?: unknown }) =>
  result.success ? {} : fieldErrorsOf((result as { error: Parameters<typeof fieldErrorsOf>[0] }).error);
const answers = (form: FormDef, values: Record<string, unknown>) => answersSchema(form).safeParse(values);

describe("devis step 1 — service", () => {
  it("requires one of the site's services, with a translatable error key", () => {
    assert.equal(errorsOf(stepSchema(0, services, "").safeParse({ service: "" })).service, "chooseActivity");
    assert.equal(errorsOf(stepSchema(0, services, "").safeParse({ service: "99" })).service, "chooseActivity");
    assert.ok(stepSchema(0, services, "").safeParse({ service: "2" }).success);
  });

  it("step 2 validates the questions of the chosen service", () => {
    const result = stepSchema(1, services, "2").safeParse({ service: "2", answers: {} });
    assert.equal(errorsOf(result)["answers.waterSource"], "required");
  });
});

describe("devis step 2 — questions built in the admin", () => {
  it("raccordé: needs the bill OR the consumption (at-least-one group)", () => {
    assert.equal(errorsOf(answers(raccorde, { usage: "domestique" })).monthlyBillTnd, "requireOne");
    assert.ok(answers(raccorde, { usage: "domestique", monthlyConsumptionKwh: "٤٥٠" }).success); // Arabic-Indic digits
  });

  it("raccordé: the phase question only exists in low voltage", () => {
    assert.ok(isVisible(raccorde.questions.find((q) => q.name === "phase")!, { voltage: "bt" }, raccorde));
    // Hidden in MV: even a forged value is ignored, and dropped from the output.
    const mv = answers(raccorde, { usage: "industriel", voltage: "mt", monthlyBillTnd: "5000", phase: "nope" });
    assert.ok(mv.success);
    assert.ok(mv.success && !("phase" in mv.data));
    const lv = answers(raccorde, { usage: "domestique", voltage: "bt", monthlyBillTnd: "80", phase: "nope" });
    assert.equal(errorsOf(lv).phase, "invalidOption");
  });

  it("pompage: required questions, numbers and forged choices", () => {
    const errors = errorsOf(answers(pompage, {}));
    assert.equal(errors.waterSource, "required");
    assert.equal(errors.flowM3PerDay, "required");
    const base = { waterSource: "forage", flowM3PerDay: "40" };
    assert.equal(errorsOf(answers(pompage, { ...base, depthM: "abc" })).depthM, "number");
    assert.equal(errorsOf(answers(pompage, { ...base, waterSource: "nope" })).waterSource, "invalidOption");
    assert.equal(errorsOf(answers(pompage, { ...base, depthM: "99999" })).depthM, "tooLarge");
  });

  it("site isolé / éclairage public: questions depend on the project", () => {
    assert.equal(errorsOf(answers(isole, {})).subtype, "required");
    assert.equal(errorsOf(answers(isole, { subtype: "site-isole" })).dailyConsumptionKwh, "required");
    const lighting = answers(isole, { subtype: "eclairage-public" });
    assert.equal(errorsOf(lighting).lightPoints, "required");
    assert.equal(errorsOf(lighting).dailyConsumptionKwh, undefined);
    assert.equal(errorsOf(answers(isole, { subtype: "eclairage-public", lightPoints: "0" })).lightPoints, "tooSmall");
    assert.ok(answers(isole, { subtype: "eclairage-public", lightPoints: "40", roadType: "rue" }).success);
  });

  it("centrale: annual consumption is only asked for self-generation", () => {
    const base = { targetPowerMw: "2", projectStage: "idee" };
    const concession = answers(centrale, { ...base, regime: "autorisation-concession", annualConsumptionMwh: "900" });
    assert.ok(concession.success && !("annualConsumptionMwh" in concession.data));
    const self = answers(centrale, { ...base, regime: "autoproduction", annualConsumptionMwh: "900" });
    assert.ok(self.success && self.data.annualConsumptionMwh === 900);
  });
});

describe("devis steps 3–4 — contact and consent", () => {
  it("flags phone, email and region", () => {
    const errors = errorsOf(stepSchema(2, services, "").safeParse({ ...contact, phone: "12", email: "x@", region: "" }));
    assert.deepEqual(
      { phone: errors.phone, email: errors.email, region: errors.region },
      { phone: "invalidPhone", email: "invalidEmail", region: "required" },
    );
  });

  it("requires consent", () => {
    assert.equal(errorsOf(stepSchema(3, services, "").safeParse({ consent: false })).consent, "consent");
  });
});

describe("devis full schema — server-side output", () => {
  const parsed = devisSchema(
    services.map((s) => s.id),
    pompage,
  ).safeParse({
    ...contact,
    service: "2",
    email: " Ali@Example.TN ",
    answers: { waterSource: "forage", flowM3PerDay: "40", depthM: "80", headM: "", monthlyBillTnd: "999" },
  });

  it("accepts a valid pompage request", () => {
    assert.ok(parsed.success);
  });

  it("normalizes phone and email and applies the default channel", () => {
    assert.ok(parsed.success);
    assert.equal(parsed.data.phone, "+21698123456");
    assert.equal(parsed.data.email, "ali@example.tn");
    assert.equal(parsed.data.preferredChannel, "call");
  });

  it("parses numbers, drops empty answers and unknown keys", () => {
    assert.ok(parsed.success);
    assert.deepEqual(parsed.data.answers, { waterSource: "forage", flowM3PerDay: 40, depthM: 80 });
  });

  it("builds localized summaries from the form", () => {
    assert.ok(parsed.success);
    const fr = answersSummary(pompage, parsed.data.answers, "fr");
    assert.ok(fr.some((row) => row.value === "Forage"));
    assert.ok(fr.some((row) => row.value === "40 m³/jour"));
    assert.ok(answersSummary(pompage, parsed.data.answers, "ar").some((row) => row.value === "حفر"));
    assert.ok(contactSummary(parsed.data, "fr").some((row) => row.value === "Kasserine"));
  });

  it("rejects a non-object payload", () => {
    assert.equal(devisSchema(["2"], pompage).safeParse("not an object").success, false);
  });
});
