import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { assertProductionEnv } from "../../src/lib/security/production-env";

const base = { NODE_ENV: "production", DATABASE_URI: "postgres://x" } as NodeJS.ProcessEnv;
const strong = "a".repeat(64);

describe("assertProductionEnv", () => {
  it("rejects the placeholder secret shipped in .env.example", () => {
    assert.throws(() => assertProductionEnv({ ...base, PAYLOAD_SECRET: "change-me" }), /placeholder/);
  });

  it("rejects the Dockerfile build-time placeholder at runtime", () => {
    assert.throws(() => assertProductionEnv({ ...base, PAYLOAD_SECRET: "build-time-placeholder" }), /placeholder/);
  });

  it("rejects a too-short secret", () => {
    assert.throws(() => assertProductionEnv({ ...base, PAYLOAD_SECRET: "short" }), /too short/);
  });

  it("rejects a missing secret", () => {
    assert.throws(() => assertProductionEnv({ ...base }), /too short/);
  });

  it("accepts a strong secret in production", () => {
    assert.doesNotThrow(() => assertProductionEnv({ ...base, PAYLOAD_SECRET: strong }));
  });

  it("never blocks development, whatever the secret", () => {
    assert.doesNotThrow(() => assertProductionEnv({ NODE_ENV: "development", PAYLOAD_SECRET: "change-me" } as NodeJS.ProcessEnv));
    assert.doesNotThrow(() => assertProductionEnv({ PAYLOAD_SECRET: "change-me" } as unknown as NodeJS.ProcessEnv));
  });
});
