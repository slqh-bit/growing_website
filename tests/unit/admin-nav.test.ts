import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isActiveHref, navEntries } from "../../src/cms/nav";

const keys = (entries: { key: string }[]) => entries.map((entry) => entry.key);

describe("navEntries", () => {
  it("gives staff seven entries", () => {
    assert.deepEqual(keys(navEntries({ isAdmin: false, siteId: 2 })), [
      "home",
      "requests",
      "pages",
      "services",
      "projects",
      "library",
      "company",
    ]);
  });

  it("adds Settings for administrators only", () => {
    const entries = navEntries({ isAdmin: true, siteId: 2 });
    assert.equal(entries.length, 8);
    assert.equal(entries.at(-1)?.key, "settings");
    assert.deepEqual(keys(entries.at(-1)?.children ?? []), ["sites", "redirects", "users", "group"]);
  });

  it("opens My company on the workspace's own site", () => {
    const company = navEntries({ isAdmin: false, siteId: 7 }).find((entry) => entry.key === "company");
    assert.equal(company?.href, "/admin/collections/sites/7");
  });

  it("drops My company when there is no workspace", () => {
    assert.equal(
      navEntries({ isAdmin: false, siteId: null }).some((entry) => entry.key === "company"),
      false,
    );
  });

  it("groups the library and puts quote forms under Requests", () => {
    const entries = navEntries({ isAdmin: false, siteId: 1 });
    assert.deepEqual(keys(entries.find((entry) => entry.key === "library")?.children ?? []), [
      "faq",
      "team",
      "partners",
      "media",
      "company-documents",
    ]);
    const requests = entries.find((entry) => entry.key === "requests");
    assert.equal(requests?.href, "/admin/collections/devis-requests");
    assert.equal(requests?.badge, "newRequests");
    assert.deepEqual(keys(requests?.children ?? []), ["forms"]);
  });

  it("labels every entry in the three admin languages", () => {
    for (const entry of navEntries({ isAdmin: true, siteId: 1 })) {
      for (const item of [entry, ...(entry.children ?? [])]) {
        assert.ok(item.label.fr && item.label.en && item.label.ar, item.key);
      }
    }
  });
});

describe("isActiveHref", () => {
  it("matches the page and everything under it", () => {
    assert.equal(isActiveHref("/admin/collections/pages", "/admin/collections/pages"), true);
    assert.equal(isActiveHref("/admin/collections/pages/12", "/admin/collections/pages"), true);
  });

  it("doesn't match a sibling that only shares a prefix", () => {
    assert.equal(isActiveHref("/admin/collections/devis-requests", "/admin/collections/devis"), false);
  });

  it("matches Home only on the home screen", () => {
    assert.equal(isActiveHref("/admin", "/admin"), true);
    assert.equal(isActiveHref("/admin/collections/pages", "/admin"), false);
  });
});
