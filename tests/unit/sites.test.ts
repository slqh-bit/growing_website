import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { matchSite, normalizeHost, type SiteDomains } from "../../src/sites/config";
import { hexToOklch, themeVars } from "../../src/lib/theme";

const sites: SiteDomains[] = [
  { key: "growing", isDefault: true, domains: [{ domain: "growing-technologies.tn" }] },
  { key: "hikview", isDefault: false, domains: [{ domain: "hikview.tn" }, { domain: "www.hikview.com.tn" }] },
];

describe("normalizeHost", () => {
  it("lowercases and drops the port and trailing dot", () => {
    assert.equal(normalizeHost("Hikview.TN:443"), "hikview.tn");
    assert.equal(normalizeHost("growing.localhost:3000"), "growing.localhost");
    assert.equal(normalizeHost("hikview.tn."), "hikview.tn");
  });

  it("maps anything that isn't a hostname to localhost", () => {
    assert.equal(normalizeHost(null), "localhost");
    assert.equal(normalizeHost(""), "localhost");
    assert.equal(normalizeHost("a<b>"), "localhost");
    assert.equal(normalizeHost("../etc"), "localhost");
  });
});

describe("matchSite", () => {
  it("matches the domains set in the admin, with or without www.", () => {
    assert.equal(matchSite("hikview.tn", sites), "hikview");
    assert.equal(matchSite("www.hikview.tn", sites), "hikview");
    assert.equal(matchSite("hikview.com.tn", sites), "hikview");
    assert.equal(matchSite("growing-technologies.tn", sites), "growing");
  });

  it("matches <key>.localhost in development", () => {
    assert.equal(matchSite("hikview.localhost", sites), "hikview");
    assert.equal(matchSite("growing.localhost", sites), "growing");
  });

  it("falls back to the default site, else the first one", () => {
    assert.equal(matchSite("localhost", sites), "growing");
    assert.equal(matchSite("unknown.example.com", sites), "growing");
    assert.equal(matchSite("group.localhost", sites), "growing"); // no "group" site yet
    assert.equal(matchSite("x.tn", [{ ...sites[1]!, isDefault: true }, { ...sites[0]!, isDefault: false }]), "hikview");
    assert.equal(matchSite("x.tn", sites.map((s) => ({ ...s, isDefault: false }))), "growing");
  });

  it("returns null when no site exists", () => {
    assert.equal(matchSite("localhost", []), null);
  });
});

describe("theme", () => {
  it("converts hex to OKLCH", () => {
    const white = hexToOklch("#ffffff");
    assert.ok(Math.abs(white.l - 1) < 1e-3 && white.c < 1e-3);
    const blue = hexToOklch("#1f6fd1");
    assert.ok(Math.abs(blue.h - 256.3) < 0.5, `hue ${blue.h}`);
  });

  it("emits hue/intensity variables for valid colours only", () => {
    assert.deepEqual(themeVars({ primary: "#1f6fd1", accent: null }), {
      "--primary-h": "256.3",
      "--primary-c": "1.055",
    });
    assert.deepEqual(themeVars({ primary: "blue", accent: "#12345" }), {});
    assert.deepEqual(themeVars(null), {});
  });

  it("caps very saturated colours", () => {
    assert.equal(themeVars({ primary: "#ff00ff" })["--primary-c"], "1.6");
  });
});
