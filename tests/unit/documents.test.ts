import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { daysLeft, expiryLevel, isExpired, needsAlert, startOfTunisDay } from "../../src/lib/documents";

// 30 Sept 2026, 10:00 in Tunis (UTC+1).
const now = new Date("2026-09-30T09:00:00Z");

describe("company document validity", () => {
  it("counts days in Tunis, whatever time the date was saved at", () => {
    assert.equal(daysLeft("2026-09-30T23:00:00.000Z", now), 1); // 1 Oct 00:00 in Tunis
    assert.equal(daysLeft("2026-10-01T12:00:00.000Z", now), 1);
    assert.equal(daysLeft("2026-09-29T23:00:00.000Z", now), 0); // today
    assert.equal(daysLeft(null, now), null);
  });

  it("is valid on its last day and expired the day after", () => {
    assert.equal(expiryLevel("2026-09-29T23:00:00.000Z", now), "urgent");
    assert.equal(isExpired("2026-09-29T23:00:00.000Z", now), false);
    assert.equal(isExpired("2026-09-28T23:00:00.000Z", now), true);
    assert.equal(isExpired(null, now), false); // never expires
  });

  it("warns 30 days ahead, urgently 7 days ahead", () => {
    const inDays = (n: number) => new Date(Date.UTC(2026, 8, 30 + n, 12)).toISOString();
    assert.equal(expiryLevel(inDays(31), now), "valid");
    assert.equal(expiryLevel(inDays(30), now), "soon");
    assert.equal(expiryLevel(inDays(8), now), "soon");
    assert.equal(expiryLevel(inDays(7), now), "urgent");
    assert.equal(expiryLevel(inDays(-1), now), "expired");
  });

  it("alerts once per new level, never for a valid document", () => {
    assert.equal(needsAlert("valid", null), false);
    assert.equal(needsAlert("soon", null), true);
    assert.equal(needsAlert("soon", "soon"), false);
    assert.equal(needsAlert("urgent", "soon"), true);
    assert.equal(needsAlert("expired", "urgent"), true);
    assert.equal(needsAlert("expired", "expired"), false);
    // A document found already expired (e.g. added late) is announced once, as expired.
    assert.equal(needsAlert("expired", null), true);
  });

  it("the public cut-off is midnight in Tunis", () => {
    assert.equal(startOfTunisDay(now).toISOString(), "2026-09-29T23:00:00.000Z");
    assert.equal(startOfTunisDay(new Date("2026-09-30T23:30:00Z")).toISOString(), "2026-09-30T23:00:00.000Z");
  });
});
