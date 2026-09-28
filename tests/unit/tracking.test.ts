import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildTrackingView, normalizeReference } from "../../src/lib/devis/tracking";

const created = "2026-09-20T08:00:00.000Z";
const lead = (status: string, statusHistory: { status: string; changedAt: string }[] = []) =>
  buildTrackingView({
    reference: "GT-260920-AB12",
    activity: "pompage",
    status,
    createdAt: created,
    statusHistory,
  });

describe("buildTrackingView", () => {
  it("a new lead is received, with the creation date", () => {
    const view = lead("nouveau");
    assert.equal(view.current, "received");
    assert.equal(view.outcome, null);
    assert.deepEqual(
      view.steps.map((s) => [s.step, s.reached, s.at]),
      [
        ["received", true, created],
        ["review", false, null],
        ["quote", false, null],
        ["done", false, null],
      ],
    );
  });

  it("dates each step from the history; skipped steps are passed but undated", () => {
    const view = lead("devis-envoye", [
      { status: "nouveau", changedAt: created },
      { status: "devis-envoye", changedAt: "2026-09-25T10:00:00.000Z" },
    ]);
    assert.equal(view.current, "quote");
    assert.deepEqual(
      view.steps.map((s) => [s.reached, s.at]),
      [
        [true, created],
        [true, null],
        [true, "2026-09-25T10:00:00.000Z"],
        [false, null],
      ],
    );
  });

  it("maps won/lost to a confirmed or closed outcome, never 'lost'", () => {
    assert.equal(lead("gagne").outcome, "confirmed");
    assert.equal(lead("perdu").outcome, "closed");
    assert.equal(lead("perdu").current, "done");
  });

  it("keeps the earliest date and ignores steps after a status moved back", () => {
    const view = lead("contacte", [
      { status: "contacte", changedAt: "2026-09-22T00:00:00.000Z" },
      { status: "devis-envoye", changedAt: "2026-09-23T00:00:00.000Z" },
      { status: "contacte", changedAt: "2026-09-24T00:00:00.000Z" },
    ]);
    assert.equal(view.current, "review");
    assert.equal(view.steps[1]!.at, "2026-09-22T00:00:00.000Z");
    assert.deepEqual(view.steps[2], { step: "quote", reached: false, at: null });
  });

  it("treats an unknown status as new", () => {
    assert.equal(lead("bogus").current, "received");
  });
});

describe("normalizeReference", () => {
  it("accepts case, spacing and Arabic-Indic digit variants", () => {
    for (const input of [
      "GT-260928-E88A",
      " gt-260928-e88a ",
      "GT 260928 E88A",
      "gt260928e88a",
      "GT-٢٦٠٩٢٨-E88A",
    ]) {
      assert.equal(normalizeReference(input), "GT-260928-E88A", input);
    }
  });

  it("rejects malformed references", () => {
    for (const input of [
      "",
      "GT-26092-E88A",
      "GT-260928-E88",
      "XX-260928-E88A",
      "GT-260928-G88A",
      "GT-260928-E88A1",
    ]) {
      assert.equal(normalizeReference(input), null, input);
    }
  });
});
