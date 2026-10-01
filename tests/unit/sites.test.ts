import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { matchSite, normalizeHost, type SiteDomains } from "../../src/sites/config";
import { brandHex, hexToOklch, oklchToHex, themeVars } from "../../src/lib/theme";
import { findRedirect, normalizeRedirectPath, redirectTarget, type RedirectRule } from "../../src/lib/redirects";

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

describe("redirects", () => {
  const rules: RedirectRule[] = [
    { from: "/services/basse-tension", to: "/services/installation-raccordee#commercial", permanent: true, sites: ["growing"] },
    { from: "/old-page", to: "/about", permanent: false, sites: [] },
    { from: "/old-page", to: "/contact", permanent: true, sites: ["hikview"] },
    { from: "/partner", to: "https://example.com/x", permanent: true, sites: [] },
  ];

  it("normalizes paths", () => {
    assert.equal(normalizeRedirectPath("services/basse-tension/"), "/services/basse-tension");
    assert.equal(normalizeRedirectPath("//a//b?x=1#y"), "/a/b");
    assert.equal(normalizeRedirectPath("/"), "/");
  });

  it("matches per site, a site-specific rule winning over an all-sites one", () => {
    assert.equal(findRedirect("/services/basse-tension/", "growing", rules)?.to, "/services/installation-raccordee#commercial");
    assert.equal(findRedirect("/services/basse-tension", "hikview", rules), undefined);
    assert.equal(findRedirect("/old-page", "growing", rules)?.to, "/about");
    assert.equal(findRedirect("/old-page", "hikview", rules)?.to, "/contact");
    assert.equal(findRedirect("/nope", "growing", rules), undefined);
  });

  it("builds the target in the visitor's language, keeping the anchor", () => {
    assert.equal(redirectTarget("/services/installation-raccordee#commercial", "ar"), "/ar/services/installation-raccordee#commercial");
    assert.equal(redirectTarget("/", "en"), "/en");
    assert.equal(redirectTarget("/#top", "fr"), "/fr#top");
    assert.equal(redirectTarget("https://example.com/x", "fr"), "https://example.com/x");
  });
});

describe("brand colours for generated share images", () => {
  it("converts OKLCH back to the same hex", () => {
    for (const hex of ["#1f6fd1", "#06b6d4", "#16a34a", "#000000", "#ffffff"]) {
      assert.equal(oklchToHex(hexToOklch(hex)), hex);
    }
  });

  it("follows the site's colours, else the default (Growing) palette", () => {
    const growing = brandHex(null);
    const hikview = brandHex({ primary: "#1f6fd1", accent: "#06b6d4" });
    assert.match(growing.from, /^#[0-9a-f]{6}$/);
    assert.notEqual(growing.from, hikview.from);
    // Hikview's blue stays blue: blue channel dominates.
    const [r, , b] = [1, 3, 5].map((i) => parseInt(hikview.from.slice(i, i + 2), 16));
    assert.ok(b! > r!);
  });
});

