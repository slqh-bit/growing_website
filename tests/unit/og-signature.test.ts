import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isSignedOgTitle, signOgTitle } from "../../src/lib/og-signature";

const secret = "test-secret-0123456789abcdef";

describe("OG title signature", () => {
  it("accepts the signature the site generated for that title", () => {
    const title = "Pompage solaire — Kairouan";
    assert.equal(isSignedOgTitle(title, signOgTitle(title, secret), secret), true);
  });

  it("refuses a different title, a missing or forged signature, or another secret", () => {
    const sig = signOgTitle("Nos services", secret);
    assert.equal(isSignedOgTitle("Nous sommes en faillite", sig, secret), false);
    assert.equal(isSignedOgTitle("Nos services", null, secret), false);
    assert.equal(isSignedOgTitle("Nos services", "x".repeat(sig.length), secret), false);
    assert.equal(isSignedOgTitle("Nos services", sig, "another-secret"), false);
  });

  it("refuses everything when no secret is configured", () => {
    assert.equal(isSignedOgTitle("Nos services", signOgTitle("Nos services", ""), ""), false);
  });

  it("is URL-safe", () => {
    assert.match(signOgTitle("Énergie & eau ?/#", secret), /^[A-Za-z0-9_-]{22}$/);
  });
});
