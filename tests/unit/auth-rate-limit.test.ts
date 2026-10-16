import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AUTH_LIMITS, allowAuthAttempt, limitAuthAttempts } from "../../src/cms/auth-rate-limit";

const ip = () => `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

describe("allowAuthAttempt", () => {
  it("allows the per-IP login budget, then refuses", () => {
    const client = ip();
    for (let i = 0; i < AUTH_LIMITS.login.perIp; i++)
      assert.equal(allowAuthAttempt("login", client, undefined, i), true);
    assert.equal(allowAuthAttempt("login", client, undefined, 100), false);
    assert.equal(
      allowAuthAttempt("login", ip(), undefined, 100),
      true,
      "other clients are unaffected",
    );
  });

  it("frees login attempts once the window has passed", () => {
    const client = ip();
    for (let i = 0; i < AUTH_LIMITS.login.perIp; i++)
      allowAuthAttempt("login", client, undefined, 0);
    assert.equal(allowAuthAttempt("login", client, undefined, AUTH_LIMITS.login.windowMs), true);
  });

  it("limits reset emails per address across IPs (no inbox flooding)", () => {
    const email = `admin-${Math.random()}@example.com`;
    for (let i = 0; i < AUTH_LIMITS.forgotPassword.perEmail; i++) {
      assert.equal(allowAuthAttempt("forgotPassword", ip(), email, i), true);
    }
    assert.equal(allowAuthAttempt("forgotPassword", ip(), ` ${email.toUpperCase()} `, 10), false);
  });

  it("gives the shared 'unknown' bucket a higher ceiling", () => {
    const n = AUTH_LIMITS.login.perIp + 1;
    for (let i = 0; i < n; i++) allowAuthAttempt("login", "unknown", undefined, 5_000_000 + i);
    assert.equal(allowAuthAttempt("login", "unknown", undefined, 5_000_000 + n), true);
  });
});

type HookArgs = Parameters<typeof limitAuthAttempts>[0];

function hookArgs(
  operation: string,
  headers: Record<string, string>,
  payloadAPI = "REST",
  email?: string,
): HookArgs {
  return {
    args: { data: { email } },
    operation,
    req: {
      payloadAPI,
      headers: new Headers(headers),
      i18n: { language: "en" },
      payload: { logger: { warn: () => {} } },
    },
  } as unknown as HookArgs;
}

describe("limitAuthAttempts hook", () => {
  it("answers 429 once a client exceeds the login limit", async () => {
    const headers = { "x-real-ip": ip() };
    for (let i = 0; i < AUTH_LIMITS.login.perIp; i++)
      await limitAuthAttempts(hookArgs("login", headers));
    await assert.rejects(
      async () => limitAuthAttempts(hookArgs("login", headers)),
      (error: { status?: number; message?: string }) =>
        error.status === 429 && /Too many attempts/.test(error.message ?? ""),
    );
  });

  it("never limits the Local API or other operations", async () => {
    const headers = { "x-real-ip": ip() };
    for (let i = 0; i < AUTH_LIMITS.login.perIp * 3; i++) {
      await limitAuthAttempts(hookArgs("login", headers, "local"));
      await limitAuthAttempts(hookArgs("read", headers));
    }
    await limitAuthAttempts(hookArgs("login", headers)); // REST budget still intact
  });
});
