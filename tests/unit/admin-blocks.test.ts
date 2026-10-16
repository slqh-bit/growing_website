import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { allowedBlockSlugs } from "../../src/blocks/allowed";

const all = ["hero", "stats", "cta", "groupHero", "companies", "quoteForm"];
const groupOnly = ["groupHero", "companies", "quoteForm"];

describe("allowedBlockSlugs", () => {
  it("offers a company site the common sections only", () => {
    assert.deepEqual(allowedBlockSlugs({ all, groupOnly, siteKey: "growing", used: [] }), ["hero", "stats", "cta"]);
    assert.deepEqual(allowedBlockSlugs({ all, groupOnly, siteKey: "hikview", used: ["hero"] }), ["hero", "stats", "cta"]);
  });

  it("offers the group site every section", () => {
    assert.deepEqual(allowedBlockSlugs({ all, groupOnly, siteKey: "group", used: [] }), all);
  });

  it("keeps a group section a company page already uses, so the page can still be saved", () => {
    assert.deepEqual(allowedBlockSlugs({ all, groupOnly, siteKey: "growing", used: ["hero", "quoteForm"] }), [
      "hero",
      "stats",
      "cta",
      "quoteForm",
    ]);
  });

  it("offers every section while the page's site isn't known yet", () => {
    assert.deepEqual(allowedBlockSlugs({ all, groupOnly, siteKey: null, used: [] }), all);
  });
});
