/**
 * Fail-fast guard against an insecure production configuration.
 *
 * Payload already refuses an *empty* PAYLOAD_SECRET, but not a weak or
 * placeholder one — and `.env.example` ships `PAYLOAD_SECRET=change-me`. The
 * secret signs the admin session JWT (SHA-256 → AES key), so a guessable value
 * lets anyone forge an administrator session. A deployment that copied the
 * example file would boot and serve with a publicly known secret.
 *
 * Run from `onInit` (payload.config.ts): that fires at real server startup, not
 * during `next build` (which runs with a placeholder secret, see Dockerfile),
 * so this refuses to *serve* with a weak secret without breaking the build.
 */

/** Values that must never reach production — the shipped example and common stand-ins. */
const PLACEHOLDER_SECRETS = new Set([
  "change-me",
  "changeme",
  "build-time-placeholder",
  "secret",
  "payload",
  "your-secret-here",
]);

/** Minimum length for a production secret (a 32-byte hex key is 64 chars). */
const MIN_SECRET_LENGTH = 32;

export function assertProductionEnv(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV !== "production") return;

  const secret = (env.PAYLOAD_SECRET ?? "").trim();
  const problems: string[] = [];

  if (PLACEHOLDER_SECRETS.has(secret.toLowerCase())) {
    problems.push("PAYLOAD_SECRET is still a placeholder value.");
  } else if (secret.length < MIN_SECRET_LENGTH) {
    problems.push(`PAYLOAD_SECRET is too short (needs at least ${MIN_SECRET_LENGTH} characters).`);
  }

  if (problems.length > 0) {
    throw new Error(
      [
        "Refusing to start: insecure production configuration.",
        ...problems.map((p) => `  - ${p}`),
        "",
        "The secret signs admin sessions — a known value lets anyone forge one.",
        "Generate a unique secret and set PAYLOAD_SECRET to it:",
        `  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`,
      ].join("\n"),
    );
  }
}
