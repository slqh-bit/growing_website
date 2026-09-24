import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { clientIp, takeToken } from "../../src/lib/devis/rate-limit";

describe("takeToken — sliding window", () => {
  it("allows `limit` hits per window, then blocks", () => {
    const key = `t-${Math.random()}`;
    const t0 = 1_000_000;
    for (let i = 0; i < 5; i++) assert.equal(takeToken(key, 5, 60_000, t0 + i), true);
    assert.equal(takeToken(key, 5, 60_000, t0 + 10), false);
  });

  it("frees slots as old hits leave the window", () => {
    const key = `t-${Math.random()}`;
    const t0 = 2_000_000;
    for (let i = 0; i < 3; i++) takeToken(key, 3, 1_000, t0);
    assert.equal(takeToken(key, 3, 1_000, t0 + 999), false);
    assert.equal(takeToken(key, 3, 1_000, t0 + 1_000), true);
  });

  it("keeps keys independent", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    takeToken(a, 1, 60_000, 0);
    assert.equal(takeToken(a, 1, 60_000, 1), false);
    assert.equal(takeToken(b, 1, 60_000, 1), true);
  });
});

describe("clientIp", () => {
  it("prefers X-Real-IP (overwritten by Caddy) over X-Forwarded-For", () => {
    const headers = new Headers({
      "x-real-ip": "41.230.1.2",
      "x-forwarded-for": "6.6.6.6, 41.230.1.2",
    });
    assert.equal(clientIp(headers), "41.230.1.2");
  });

  it("falls back to the first X-Forwarded-For entry, then 'unknown'", () => {
    assert.equal(
      clientIp(new Headers({ "x-forwarded-for": " 197.1.2.3 , 10.0.0.1" })),
      "197.1.2.3",
    );
    assert.equal(clientIp(new Headers()), "unknown");
  });
});
