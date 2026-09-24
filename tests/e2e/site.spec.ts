import { expect, test } from "@playwright/test";

test.describe("locales and layout", () => {
  for (const { browserLanguage, expected } of [
    { browserLanguage: "ar-TN", expected: "ar" },
    { browserLanguage: "de-DE", expected: "fr" }, // unsupported → default locale
  ]) {
    test(`/ sends a ${browserLanguage} browser to /${expected}`, async ({ browser }) => {
      const context = await browser.newContext({ locale: browserLanguage });
      const page = await context.newPage();
      await page.goto("/");
      await expect(page).toHaveURL(new RegExp(`/${expected}$`));
      await context.close();
    });
  }

  for (const { locale, dir } of [
    { locale: "fr", dir: "ltr" },
    { locale: "ar", dir: "rtl" },
    { locale: "en", dir: "ltr" },
  ]) {
    test(`/${locale} renders with lang="${locale}" dir="${dir}"`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(String(error)));

      const response = await page.goto(`/${locale}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("html")).toHaveAttribute("dir", dir);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator(`link[rel="alternate"][hreflang="x-default"]`)).toHaveCount(1);
      expect(errors).toEqual([]);
    });
  }

  test("language switcher keeps the current page", async ({ page, isMobile }) => {
    test.skip(isMobile, "switcher lives in the mobile menu; covered on desktop");
    await page.goto("/fr/services");
    await page.getByRole("button", { name: /FR/ }).click();
    await page.getByRole("option", { name: "العربية" }).click();
    await expect(page).toHaveURL(/\/ar\/services$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("unknown pages return a localized 404", async ({ page }) => {
    for (const { locale, title } of [
      { locale: "fr", title: "Page introuvable" },
      { locale: "ar", title: "الصفحة غير موجودة" },
    ]) {
      const response = await page.goto(`/${locale}/cette-page-n-existe-pas`);
      expect(response?.status()).toBe(404);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    }
  });
});

test.describe("content pages", () => {
  test("services list links to a service detail page", async ({ page }) => {
    await page.goto("/fr/services");
    const firstCard = page.locator('main a[href^="/fr/services/"]').first();
    const href = await firstCard.getAttribute("href");
    await firstCard.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('script[type="application/ld+json"]')).not.toHaveCount(0);
  });

  test("projects page lists projects", async ({ page }) => {
    await page.goto("/en/projects");
    await expect(page.locator('main a[href^="/en/projects/"]').first()).toBeVisible();
  });
});

test.describe("SEO and platform endpoints", () => {
  test("home page carries LocalBusiness JSON-LD", async ({ page }) => {
    await page.goto("/fr");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = blocks.map((text) => JSON.parse(text)["@type"]);
    expect(types).toContain("Electrician");
  });

  test("sitemap lists every locale with hreflang alternates", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.ok()).toBeTruthy();
    const xml = await response.text();
    for (const path of ["/fr", "/ar/services", "/en/devis"]) expect(xml).toContain(`${path}</loc>`);
    expect(xml).toContain('hreflang="x-default"');
    expect(xml).not.toContain("/admin");
  });

  test("robots.txt blocks the admin and points to the sitemap", async ({ request }) => {
    const text = await (await request.get("/robots.txt")).text();
    expect(text).toContain("Disallow: /admin");
    expect(text).toMatch(/Sitemap: .*\/sitemap\.xml/);
  });

  test("health endpoint reports the database", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    expect(await response.json()).toMatchObject({ status: "ok", db: "ok" });
  });

  test("security headers are set", async ({ request }) => {
    const response = await request.get("/fr");
    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(headers["x-powered-by"]).toBeUndefined();
    expect(headers["critical-ch"]).toBeUndefined();
  });
});
