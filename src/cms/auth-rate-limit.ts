import { APIError, type CollectionBeforeOperationHook } from "payload";
import { clientIp, takeToken } from "../lib/rate-limit";

/**
 * Per-IP limits on the admin's public auth endpoints. Payload already locks an
 * account after 5 failed logins (Users.auth) and sends at most one reset email
 * per account every 15 s; these limits stop one client from cycling through
 * accounts, guessing passwords at scale or flooding inboxes with reset emails.
 * Without a proxy header every client shares the "unknown" bucket, hence its
 * higher ceiling (see src/lib/devis/actions.ts).
 */
export const AUTH_LIMITS = {
  login: { perIp: 10, unknownIp: 50, windowMs: 15 * 60_000 },
  forgotPassword: { perIp: 3, unknownIp: 20, perEmail: 3, windowMs: 60 * 60_000 },
} as const;

type AuthOperation = keyof typeof AUTH_LIMITS;

/** Whether this request may go ahead (and counts it). `email` only for forgotPassword. */
export function allowAuthAttempt(
  operation: AuthOperation,
  ip: string,
  email?: string,
  now = Date.now(),
): boolean {
  const limit = AUTH_LIMITS[operation];
  const perIp = ip === "unknown" ? limit.unknownIp : limit.perIp;
  if (!takeToken(`${operation}:ip:${ip}`, perIp, limit.windowMs, now)) return false;
  if (operation === "forgotPassword" && email) {
    return takeToken(
      `${operation}:email:${email.trim().toLowerCase()}`,
      AUTH_LIMITS.forgotPassword.perEmail,
      limit.windowMs,
      now,
    );
  }
  return true;
}

const tooMany = {
  fr: "Trop de tentatives. Réessayez dans quelques minutes.",
  en: "Too many attempts. Please try again in a few minutes.",
  ar: "محاولات كثيرة جدًا. أعد المحاولة بعد بضع دقائق.",
} as const;

/** Users.hooks.beforeOperation: refuses login / forgot-password requests over the limits with 429. */
export const limitAuthAttempts: CollectionBeforeOperationHook = ({ args, operation, req }) => {
  if (operation !== "login" && operation !== "forgotPassword") return args;
  // Seed, scripts and server code call the Local API: no client to limit.
  if (req.payloadAPI === "local") return args;

  const email = (args as { data?: { email?: unknown } }).data?.email;
  const ip = clientIp(req.headers);
  if (allowAuthAttempt(operation, ip, typeof email === "string" ? email : undefined)) return args;

  req.payload.logger.warn(`Admin ${operation} rate limit hit for ${ip}.`);
  const language = req.i18n?.language;
  const message = language === "ar" || language === "en" ? tooMany[language] : tooMany.fr;
  throw new APIError(message, 429, null, true);
};
