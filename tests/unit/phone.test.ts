import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isValidTnPhone, normalizeTnPhone } from "../../src/lib/devis/phone";

describe("Tunisian phone numbers", () => {
  it("normalizes local, international and Arabic-Indic input to +216XXXXXXXX", () => {
    assert.equal(normalizeTnPhone("98 123 456"), "+21698123456");
    assert.equal(normalizeTnPhone("00216-98.123.456"), "+21698123456");
    assert.equal(normalizeTnPhone("+216 98 123 456"), "+21698123456");
    assert.equal(normalizeTnPhone("٩٨١٢٣٤٥٦"), "+21698123456");
  });

  it("accepts mobile and landline prefixes", () => {
    for (const n of ["21 234 567", "41 234 567", "51 234 567", "98 123 456", "77 123 456"]) {
      assert.ok(isValidTnPhone(n), n);
    }
  });

  it("rejects numbers starting with 0/1, wrong length and foreign numbers", () => {
    for (const n of ["12345678", "01234567", "9812345", "981234567", "+33612345678", ""]) {
      assert.equal(isValidTnPhone(n), false, n);
    }
  });
});
