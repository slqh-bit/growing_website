import "server-only";

/**
 * Sliding-window rate limiter held in process memory. Enough for the single
 * app container of the v1 deployment; move to Postgres/Redis if the app ever
 * runs as several instances.
 */
const hits = new Map<string, number[]>();
const MAX_KEYS = 10_000;

/** Returns true (and records a hit) if `key` is under `limit` hits per `windowMs`. */
export function takeToken(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);

  if (hits.size > MAX_KEYS) {
    // Drop keys whose newest hit is outside the window (bounded memory).
    for (const [k, times] of hits) {
      if (now - (times.at(-1) ?? 0) >= windowMs) hits.delete(k);
    }
  }
  return true;
}

/**
 * Client IP as set by the reverse proxy. The bundled Caddyfile (deploy/)
 * overwrites X-Real-IP with the TCP peer address, so it can't be spoofed and
 * wins; X-Forwarded-For is the fallback for other proxies. Either is only
 * trustworthy when the app is reachable exclusively through that proxy.
 */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip")?.trim() ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
