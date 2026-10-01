import { test as base, expect } from "@playwright/test";

/**
 * Shared test setup. Locally the suite runs against growing.localhost (plain
 * localhost is the group site): Chromium resolves *.localhost itself, but the
 * API request context runs in Node, which doesn't — so API calls go to
 * localhost with the site's Host header instead.
 */
export const test = base.extend({
  request: async ({ playwright, baseURL }, use) => {
    const url = new URL(baseURL ?? "http://localhost");
    const local = url.hostname.endsWith(".localhost");
    const host = url.host;
    if (local) url.hostname = "localhost";
    const context = await playwright.request.newContext({
      baseURL: url.origin,
      ...(local && { extraHTTPHeaders: { host } }),
    });
    await use(context);
    await context.dispose();
  },
});

export { expect };

/** The same path on another site of the group (hikview.localhost, or plain localhost for the group). */
export function onHost(baseURL: string | undefined, host: string, path: string): string {
  const url = new URL(path, baseURL);
  url.hostname = host;
  return url.toString();
}
