import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { telHref, whatsappHref } from "../../src/lib/contact-links";

describe("contact links", () => {
  it("builds dialable tel: links", () => {
    assert.equal(telHref("+216 98 123 456"), "tel:+21698123456");
    assert.equal(telHref("77.123.456"), "tel:77123456");
  });

  it("builds wa.me links without the plus sign", () => {
    assert.equal(whatsappHref("+216 98-123-456"), "https://wa.me/21698123456");
  });

  it("tolerates settings that were never saved", () => {
    assert.equal(telHref(undefined), "tel:");
    assert.equal(whatsappHref(null), "https://wa.me/");
  });
});
