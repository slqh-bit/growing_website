import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end smoke tests (tests/e2e). They run against a production build
 * connected to a seeded database:
 *
 *   npm run build && NODE_ENV=production npm run seed
 *   npm run test:e2e                    # starts `next start` on :3100
 *   E2E_BASE_URL=https://… npm run test:e2e   # or test a running deployment
 *
 * The devis spec submits a real quote request (stored as a lead).
 */
const port = Number(process.env.E2E_PORT ?? 3100);
// Growing's site: plain localhost is the group site, hikview.localhost Hikview's.
const baseURL = process.env.E2E_BASE_URL ?? `http://growing.localhost:${port}`;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testIgnore: /devis\.spec/ },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run start -- -p ${port}`,
        url: `http://localhost:${port}/api/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
