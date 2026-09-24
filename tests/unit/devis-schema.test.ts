import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  devisSchema,
  emptyDevisValues,
  fieldErrorsOf,
  stepSchemas,
} from "../../src/lib/devis/schema";
import { contactSummary, technicalSummary } from "../../src/lib/devis/fields";

const contact = {
  ...emptyDevisValues,
  fullName: "Ali Ben Salah",
  phone: "98 123 456",
  region: "kasserine",
  consent: true,
};
const step2 = (values: object) => stepSchemas[1].safeParse({ ...emptyDevisValues, ...values });
const errorsOf = (result: { success: boolean; error?: unknown }) =>
  result.success
    ? {}
    : fieldErrorsOf((result as { error: Parameters<typeof fieldErrorsOf>[0] }).error);

describe("devis step 1 — activity", () => {
  it("requires an activity, with a translatable error key", () => {
    assert.equal(errorsOf(stepSchemas[0].safeParse({ activity: "" })).activity, "chooseActivity");
  });
});

describe("devis step 2 — technical details per activity", () => {
  it("raccordé: needs the bill OR the consumption", () => {
    assert.equal(
      errorsOf(step2({ activity: "raccorde" }))["raccorde.monthlyBillTnd"],
      "billOrConsumption",
    );
    const consumptionOnly = step2({
      activity: "raccorde",
      raccorde: { ...emptyDevisValues.raccorde, monthlyConsumptionKwh: "٤٥٠" }, // Arabic-Indic digits
    });
    assert.ok(consumptionOnly.success);
  });

  it("pompage: water source and flow are required", () => {
    const errors = errorsOf(step2({ activity: "pompage" }));
    assert.equal(errors["pompage.waterSource"], "required");
    assert.equal(errors["pompage.flowM3PerDay"], "required");
  });

  it("pompage: rejects non-numeric depth and forged select values", () => {
    const pompage = { ...emptyDevisValues.pompage, waterSource: "forage", flowM3PerDay: "40" };
    assert.equal(
      errorsOf(step2({ activity: "pompage", pompage: { ...pompage, depthM: "abc" } }))[
        "pompage.depthM"
      ],
      "number",
    );
    assert.equal(
      errorsOf(step2({ activity: "pompage", pompage: { ...pompage, waterSource: "nope" } }))[
        "pompage.waterSource"
      ],
      "invalidOption",
    );
  });

  it("isolé: daily consumption is required", () => {
    assert.equal(step2({ activity: "isole" }).success, false);
  });

  it("MT: the work description needs at least 10 characters", () => {
    const result = step2({
      activity: "mt",
      electrical: { ...emptyDevisValues.electrical, workNature: "court" },
    });
    assert.equal(errorsOf(result)["electrical.workNature"], "describeWork");
  });
});

describe("devis steps 3–4 — contact and consent", () => {
  it("flags phone, email and region", () => {
    const errors = errorsOf(
      stepSchemas[2].safeParse({ ...contact, phone: "12", email: "x@", region: "" }),
    );
    assert.deepEqual(
      { phone: errors.phone, email: errors.email, region: errors.region },
      { phone: "invalidPhone", email: "invalidEmail", region: "required" },
    );
  });

  it("requires consent", () => {
    assert.equal(errorsOf(stepSchemas[3].safeParse({ consent: false })).consent, "consent");
  });
});

describe("devis full schema — server-side output", () => {
  const parsed = devisSchema.safeParse({
    ...contact,
    activity: "pompage",
    email: " Ali@Example.TN ",
    pompage: {
      waterSource: "forage",
      flowM3PerDay: "40",
      depthM: "80",
      headM: "",
      existingPumpCv: "",
    },
    raccorde: { ...emptyDevisValues.raccorde, monthlyBillTnd: "999" },
  });

  it("accepts a valid pompage lead", () => {
    assert.ok(parsed.success);
  });

  it("normalizes phone and email and applies the default channel", () => {
    assert.ok(parsed.success);
    assert.equal(parsed.data.phone, "+21698123456");
    assert.equal(parsed.data.email, "ali@example.tn");
    assert.equal(parsed.data.preferredChannel, "call");
  });

  it("parses numbers and drops the other activities' groups", () => {
    assert.ok(parsed.success);
    assert.equal(parsed.data.pompage?.depthM, 80);
    assert.equal(parsed.data.pompage?.headM, undefined);
    assert.ok(!("raccorde" in parsed.data && parsed.data.raccorde));
  });

  it("builds localized review summaries", () => {
    assert.ok(parsed.success);
    const fr = technicalSummary(parsed.data, "fr");
    assert.ok(fr.some((row) => row.value === "Forage"));
    assert.ok(fr.some((row) => row.value === "40 m³/jour"));
    assert.ok(technicalSummary(parsed.data, "ar").some((row) => row.value === "حفر"));
    assert.ok(contactSummary(parsed.data, "fr").some((row) => row.value === "Kasserine"));
  });

  it("rejects a non-object payload", () => {
    assert.equal(devisSchema.safeParse("not an object").success, false);
  });
});
