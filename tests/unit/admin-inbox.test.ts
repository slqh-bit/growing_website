import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  contactLinks,
  inboxTabs,
  nextStatus,
  parseTab,
  refusalMessage,
  tabOf,
  tabStatuses,
} from "../../src/lib/devis/inbox";

describe("inbox tabs", () => {
  it("puts every status in exactly one tab", () => {
    assert.deepEqual(tabStatuses("new"), ["nouveau"]);
    assert.deepEqual(tabStatuses("progress"), ["contacte", "devis-envoye"]);
    assert.deepEqual(tabStatuses("done"), ["gagne", "perdu"]);
    assert.deepEqual(inboxTabs, ["new", "progress", "done"]);
  });

  it("finds the tab of a status", () => {
    assert.equal(tabOf("nouveau"), "new");
    assert.equal(tabOf("devis-envoye"), "progress");
    assert.equal(tabOf("perdu"), "done");
    assert.equal(tabOf("something-else"), "new");
  });

  it("reads the tab from the URL, defaulting to New", () => {
    assert.equal(parseTab("done"), "done");
    assert.equal(parseTab(undefined), "new");
    assert.equal(parseTab("nope"), "new");
    assert.equal(parseTab(["progress", "done"]), "progress");
  });
});

describe("nextStatus", () => {
  it("walks the request through its steps", () => {
    assert.equal(nextStatus("nouveau"), "contacte");
    assert.equal(nextStatus("contacte"), "devis-envoye");
    assert.equal(nextStatus("devis-envoye"), "gagne");
  });

  it("stops once the request is won or lost", () => {
    assert.equal(nextStatus("gagne"), null);
    assert.equal(nextStatus("perdu"), null);
    assert.equal(nextStatus("something-else"), null);
  });
});

describe("contactLinks", () => {
  it("builds call, WhatsApp and email links from a Tunisian number", () => {
    assert.deepEqual(contactLinks({ phone: "+21698123456", email: "a@b.tn" }), {
      call: "tel:+21698123456",
      whatsapp: "https://wa.me/21698123456",
      email: "mailto:a@b.tn",
    });
  });

  it("adds the country code to a local number written with spaces", () => {
    assert.equal(contactLinks({ phone: "98 123 456" }).whatsapp, "https://wa.me/21698123456");
    assert.equal(contactLinks({ phone: "98 123 456" }).call, "tel:+21698123456");
  });

  it("omits what it can't build", () => {
    assert.deepEqual(contactLinks({ phone: "", email: null }), {});
    assert.deepEqual(contactLinks({ phone: null, email: "a@b.tn" }), { email: "mailto:a@b.tn" });
  });
});

describe("refusalMessage", () => {
  it("shows the field's own message when a validation refused the change", () => {
    const body = {
      errors: [
        {
          name: "ValidationError",
          message: "The following field is invalid: Devis (PDF)",
          data: { errors: [{ message: "Joignez le devis PDF avant de passer au statut « Devis envoyé ».", path: "quote" }] },
        },
      ],
    };
    assert.equal(refusalMessage(body, "fallback"), "Joignez le devis PDF avant de passer au statut « Devis envoyé ».");
  });

  it("shows the error's message otherwise", () => {
    assert.equal(refusalMessage({ errors: [{ message: "You are not allowed to perform this action." }] }, "fallback"), "You are not allowed to perform this action.");
  });

  it("falls back when the response says nothing usable", () => {
    assert.equal(refusalMessage(null, "fallback"), "fallback");
    assert.equal(refusalMessage({}, "fallback"), "fallback");
    assert.equal(refusalMessage({ errors: [] }, "fallback"), "fallback");
  });
});
