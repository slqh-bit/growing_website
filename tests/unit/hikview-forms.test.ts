import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { locales } from "../../src/i18n/config";
import {
  answersSchema,
  answersSummary,
  choiceTypes,
  isVisible,
  questionsProblem,
  type Answers,
  type FormDef,
  type QuestionDef,
} from "../../src/lib/devis/form-def";
import { attachmentMimeType, checkAttachments, matchesSignature, MAX_ATTACHMENT_BYTES } from "../../src/lib/devis/attachments";
import { devisSchema, emptyDevisValues } from "../../src/lib/devis/schema";
import { contactSummary } from "../../src/lib/devis/fields";
import { devisForms } from "../../scripts/seed-data/devis-forms";
import { hikviewServices } from "../../scripts/seed-data/hikview-services";

const hikviewForms = devisForms.filter((f) => f.site === "hikview");
const formOf = (service: string): FormDef => {
  const form = devisForms.find((f) => f.services.includes(service))!;
  return { questions: form.questions, attachments: form.attachments };
};

/** The smallest valid answer to a required question. */
function minimalAnswer(q: QuestionDef): Answers[string] {
  if (q.type === "number") return String(q.min ?? 1);
  if (q.type === "multiselect") return [q.options![0]!.value];
  if (q.type === "select" || q.type === "radio") return q.options![0]!.value;
  if (q.type === "checkbox") return true;
  if (q.type === "date") return "2026-12-31";
  return "Commune de Sbeitla";
}

describe("Hikview quote forms (plan §6.3)", () => {
  it("covers every sub-service plus the B2G area, each service once", () => {
    const linked = hikviewForms.flatMap((f) => f.services);
    const subServices = hikviewServices.filter((s) => s.parent).map((s) => s.slug);
    assert.deepEqual([...linked].sort(), [...subServices, "integration-b2g"].sort());
    assert.equal(new Set(linked).size, linked.length);
    assert.equal(hikviewForms.length, 15);
  });

  it("are well formed, in all three languages", () => {
    for (const form of devisForms) {
      assert.equal(questionsProblem(form.questions), null, form.title);
      for (const q of form.questions) {
        for (const l of locales) assert.ok((q.label as Record<string, string>)[l], `${form.title} / ${q.name} (${l})`);
        if (choiceTypes.includes(q.type)) {
          assert.ok((q.options ?? []).length > 0, `${form.title} / ${q.name} has no choices`);
          for (const o of q.options!) {
            for (const l of locales) assert.ok((o.label as Record<string, string>)[l], `${q.name} = ${o.value} (${l})`);
          }
        }
        // A condition must name a value the question it depends on can take.
        if (q.showIf?.field) {
          const parent = form.questions.find((p) => p.name === q.showIf!.field)!;
          const values = parent.type === "checkbox" ? ["true"] : (parent.options ?? []).map((o) => o.value);
          assert.ok(values.includes(q.showIf.equals ?? ""), `${form.title} / ${q.name}: showIf value`);
        }
      }
    }
  });

  it("accept their required answers and nothing less", () => {
    for (const form of hikviewForms) {
      const def: FormDef = { questions: form.questions };
      const required = form.questions.filter((q) => q.required && isVisible(q, {}, def));
      const filled = Object.fromEntries(required.map((q) => [q.name, minimalAnswer(q)]));
      assert.ok(answersSchema(def).safeParse(filled).success, form.title);
      if (required.length > 0) assert.equal(answersSchema(def).safeParse({}).success, false, form.title);
    }
  });

  it("vidéosurveillance: the existing system is only asked for an upgrade", () => {
    const def = formOf("videosurveillance");
    const base = { clientType: "professionnel", siteType: "commerce", project: "nouveau" };
    const fresh = answersSchema(def).safeParse({ ...base, existingNotes: "8 caméras analogiques" });
    assert.ok(fresh.success && !("existingNotes" in fresh.data));
    const upgrade = answersSchema(def).safeParse({ ...base, project: "extension", existingNotes: "8 caméras analogiques" });
    assert.ok(upgrade.success && upgrade.data.existingNotes === "8 caméras analogiques");
  });

  it("LAN / Wi-Fi: Wi-Fi and server-room details follow the needs ticked", () => {
    const def = formOf("reseaux-lan-wifi");
    const q = (name: string) => def.questions.find((x) => x.name === name)!;
    assert.equal(isVisible(q("wifiZones"), { scope: ["lan"] }, def), false);
    assert.ok(isVisible(q("wifiZones"), { scope: ["lan", "wifi"] }, def));
    assert.ok(isVisible(q("serverRoom"), { scope: ["salle-serveurs"] }, def));
  });

  it("incendie: the report notes appear once compliance is ticked", () => {
    const def = formOf("securite-incendie");
    const notes = def.questions.find((x) => x.name === "complianceNotes")!;
    assert.equal(isVisible(notes, { compliance: false }, def), false);
    assert.ok(isVisible(notes, { compliance: true }, def));
  });

  it("B2G: institution and needs are required, the deadline is a date, files are the tender specs", () => {
    const def = formOf("integration-b2g");
    const result = answersSchema(def).safeParse({ institution: "Commune de Sbeitla", description: "Vidéoprotection", deadline: "31/12/2026" });
    assert.equal(result.success, false);
    const ok = answersSchema(def).safeParse({
      institution: "Commune de Sbeitla",
      description: "Vidéoprotection du centre-ville",
      deadline: "2026-12-31",
      lots: ["videosurveillance", "solaire"],
    });
    assert.ok(ok.success);
    const rows = answersSummary(def, ok.data as Answers, "fr");
    assert.deepEqual(rows.find((r) => r.label === "Lots concernés")?.value, "Vidéosurveillance, Énergie solaire (avec Growing Technologies)");
    assert.equal(rows.find((r) => r.label === "Date limite de remise des offres")?.value, "31/12/2026");
    assert.equal(answersSummary(def, ok.data as Answers, "en").find((r) => r.label === "Bid submission deadline")?.value, "31/12/2026");
    assert.equal((def.attachments?.label as Record<string, string>).fr, "Cahier des charges (CDC)");
  });

  it("IoT: one form serves both IoT pages", () => {
    const owner = (slug: string) => hikviewForms.find((f) => f.services.includes(slug));
    assert.equal(owner("iot-telemetrie"), owner("smart-city"));
  });
});

describe("devis attachments", () => {
  const file = (name: string, size = 200_000) => ({ name, size });

  it("accepts plans, photos, office files and DWG", () => {
    assert.equal(checkAttachments([file("plan.PDF"), file("site.jpg"), file("cdc.docx"), file("lots.xlsx"), file("rdc.dwg")]), null);
    assert.equal(attachmentMimeType("rdc.DWG"), "image/vnd.dwg");
    assert.equal(attachmentMimeType("photo.heic"), "image/heic");
  });

  it("refuses other types, empty or large files, and more than 5 files", () => {
    assert.equal(checkAttachments([file("setup.exe")]), "fileType");
    assert.equal(checkAttachments([file("page.html")]), "fileType");
    assert.equal(checkAttachments([file("noextension")]), "fileType");
    assert.equal(checkAttachments([file("empty.pdf", 0)]), "fileTooLarge");
    assert.equal(checkAttachments([file("big.pdf", MAX_ATTACHMENT_BYTES + 1)]), "fileTooLarge");
    assert.equal(checkAttachments([1, 2, 3].map((i) => file(`p${i}.pdf`, 8 * 1024 * 1024))), "fileTooLarge"); // 24 MB in all
    assert.equal(checkAttachments([1, 2, 3, 4, 5, 6].map((i) => file(`p${i}.pdf`))), "tooManyFiles");
  });
});

describe("devis attachment contents", () => {
  const bytes = (s: string) => new Uint8Array([...s].map((c) => c.charCodeAt(0)));

  it("must match the extension", () => {
    assert.ok(matchesSignature("cdc.pdf", bytes("%PDF-1.7\n")));
    assert.ok(matchesSignature("photo.JPG", new Uint8Array([0xff, 0xd8, 0xff, 0xe0])));
    assert.ok(matchesSignature("plan.png", bytes("\x89PNG\r\n\x1a\n")));
    assert.ok(matchesSignature("lots.xlsx", bytes("PK\x03\x04")));
    assert.ok(matchesSignature("rdc.dwg", bytes("AC1032")));
    assert.ok(matchesSignature("site.heic", bytes("\0\0\0\x18ftypheic")));
  });

  it("refuses a web page or script renamed as a document", () => {
    assert.equal(matchesSignature("plan.jpg", bytes("<html><script>")), false);
    assert.equal(matchesSignature("cdc.pdf", bytes("MZ\x90\0")), false);
    assert.equal(matchesSignature("cdc.exe", bytes("MZ\x90\0")), false);
  });
});

describe("devis site visit", () => {
  it("is optional, parsed as a boolean and shown in the summary when asked", () => {
    const def = formOf("videosurveillance");
    const raw = {
      ...emptyDevisValues,
      service: "7",
      answers: { clientType: "residentiel", siteType: "maison", project: "nouveau" },
      fullName: "Sami Trabelsi",
      phone: "22 333 444",
      region: "kasserine",
      consent: true,
    };
    const without = devisSchema(["7"], def).safeParse(raw);
    assert.ok(without.success && without.data.siteVisit === false);
    const withVisit = devisSchema(["7"], def).safeParse({ ...raw, siteVisit: true });
    assert.ok(withVisit.success && withVisit.data.siteVisit === true);
    const rows = contactSummary(withVisit.data, "fr");
    assert.deepEqual(rows.at(-1), { label: "Visite technique sur site", value: "Souhaitée" });
    assert.equal(contactSummary(without.data, "fr").some((r) => r.label === "Visite technique sur site"), false);
  });
});
