import { expect, onHost, test } from "./fixtures";

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

test.describe("Multi-site (one site per domain)", () => {
  test("growing.localhost shows Growing; plain localhost, the group", async ({ page, baseURL }) => {
    await page.goto("/fr");
    await expect(page.locator("html")).toHaveAttribute("data-site", "growing");
    await expect(page).toHaveTitle(/Growing Technologies/);
    await page.goto(onHost(baseURL, "localhost", "/fr"));
    await expect(page.locator("html")).toHaveAttribute("data-site", "group");
  });

  test("hikview.localhost shows the Hikview site with its own brand colours", async ({ page, baseURL }) => {
    await page.goto(onHost(baseURL, "hikview.localhost", "/fr/contact"));
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-site", "hikview");
    await expect(html).toHaveAttribute("style", /--primary-h:\s*256/);
    await expect(page).toHaveTitle(/Hikview Engineering/);
    await expect(page.locator("header")).toContainText(/Hikview/i);
  });

  test("an unknown domain falls back to the default site", async ({ request }) => {
    const response = await request.get("/fr", { headers: { host: "unknown.example.com" } });
    expect(response.ok()).toBeTruthy();
    expect(await response.text()).toContain('data-site="growing"');
  });

  test("each site only shows its own content", async ({ page, baseURL }) => {
    await page.goto(onHost(baseURL, "hikview.localhost", "/fr/services/pompage-solaire"));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page introuvable");
    await page.goto(onHost(baseURL, "hikview.localhost", "/fr"));
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Sécurité");
  });
});

test.describe("Hikview catalogue (6 areas, sub-services)", () => {
  const hikview = (baseURL: string | undefined, path: string) => {
    const url = new URL(path, baseURL);
    url.hostname = "hikview.localhost";
    return url.toString();
  };

  test("the services page lists the six areas with their sub-services", async ({ page, baseURL }) => {
    await page.goto(hikview(baseURL, "/fr/services"));
    for (const area of [
      "securite-electronique",
      "reseaux-infrastructures",
      "gestion-point-de-vente",
      "solutions-audiovisuelles",
      "iot-smart-city",
      "integration-b2g",
    ]) {
      await expect(page.locator(`main a[href="/fr/services/${area}"]`).first()).toBeVisible();
    }
    await expect(page.locator('main a[href="/fr/services/securite-electronique/videosurveillance"]')).toBeVisible();
  });

  test("a sub-service lives under its area, and its old top-level URL redirects there", async ({ page, request, baseURL }) => {
    // Node's HTTP client doesn't resolve *.localhost: pick the site with the Host header.
    const response = await request.get("/fr/services/videosurveillance", {
      headers: { host: "hikview.localhost" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(308);
    expect(response.headers()["location"]).toMatch(/\/fr\/services\/securite-electronique\/videosurveillance$/);

    await page.goto(hikview(baseURL, "/ar/services/securite-electronique/videosurveillance"));
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("المراقبة بالفيديو");
    // Back to the area, and the other solutions of the same area.
    await expect(page.locator('main a[href="/ar/services/securite-electronique"]').first()).toBeVisible();
    await expect(page.locator('main a[href="/ar/services/securite-electronique/securite-incendie"]')).toBeVisible();
  });

  test("the B2G page explains public procurement and has its own quote form", async ({ page, baseURL }) => {
    await page.goto(hikview(baseURL, "/fr/services/integration-b2g"));
    await expect(page.locator("#marches-publics")).toBeAttached();
    await expect(page.locator('main a[href="/fr/devis?service=integration-b2g"]').first()).toBeVisible();
  });
});

test.describe("Group layer", () => {
  test("the group page presents both companies and links to the other site", async ({ page }) => {
    await page.goto("/fr/groupe");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Growing");
    await expect(page.locator("main")).toContainText("Hikview Engineering");
    await expect(page.locator("main")).toContainText("Vous êtes ici");
    await expect(page.locator('main a[href*="hikview.localhost"]').first()).toBeVisible();
  });

  test("every footer shows the group band with the sister company", async ({ page }) => {
    await page.goto("/fr/contact");
    const footer = page.locator("footer");
    await expect(footer).toContainText("Membre du");
    await expect(footer.locator('a[href*="hikview.localhost"]').first()).toBeVisible();
    await expect(footer.locator('a[href="/fr/groupe"]').first()).toBeVisible();
  });

  test("a service suggests the sister company's related services", async ({ page }) => {
    await page.goto("/fr/services/pompage-solaire");
    await expect(page.locator("main")).toContainText("Chez notre société sœur Hikview Engineering");
    await expect(
      page.locator('main a[href$="/fr/services/securite-electronique/videosurveillance"]').first(),
    ).toBeVisible();
  });
});

test.describe("Growing catalogue (4 activities)", () => {
  test("the services page lists the four activities", async ({ page }) => {
    await page.goto("/fr/services");
    for (const slug of ["pompage-solaire", "site-isole", "installation-raccordee", "centrale-photovoltaique"]) {
      await expect(page.locator(`main a[href="/fr/services/${slug}"]`).first()).toBeVisible();
    }
    await expect(page.locator('main a[href="/fr/services/basse-tension"]')).toHaveCount(0);
  });

  test("retired BT/MT pages redirect permanently to their section", async ({ page, request }) => {
    const response = await request.get("/fr/services/basse-tension", { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers()["location"]).toMatch(/\/fr\/services\/installation-raccordee#commercial$/);

    await page.goto("/ar/services/moyenne-tension");
    await expect(page).toHaveURL(/\/ar\/services\/installation-raccordee#industriel$/);
    await expect(page.locator("#industriel")).toBeInViewport();
  });

  test("the PV plant page has its sections and its own quote form", async ({ page }) => {
    await page.goto("/fr/services/centrale-photovoltaique");
    await expect(page.locator("#autoproduction")).toBeAttached();
    await expect(page.locator('main a[href="/fr/devis?service=centrale-photovoltaique"]').first()).toBeVisible();
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

  test("each company announces its own business type, within the group", async ({ page, baseURL }) => {
    const url = new URL("/fr", baseURL);
    url.hostname = "hikview.localhost";
    await page.goto(url.toString());
    const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));
    const company = blocks.find((b) => b["@type"] === "ProfessionalService");
    expect(company?.name).toBe("Hikview Engineering");
    expect(company?.parentOrganization?.["@type"]).toBe("Organization");
    expect(blocks.map((b) => b["@type"])).toContain("WebSite");
  });

  test("pages without their own image share one generated in the site's colours", async ({ page, request }) => {
    await page.goto("/fr/about");
    const image = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(image).toMatch(/\/fr\/og\?title=/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
    const response = await request.get(new URL(image!).pathname + new URL(image!).search);
    expect(response.headers()["content-type"]).toBe("image/png");
  });

  test("robots.txt blocks the admin and points to the sitemap", async ({ request }) => {
    const text = await (await request.get("/robots.txt")).text();
    expect(text).toContain("Disallow: /admin");
    expect(text).toMatch(/Sitemap: .*\/sitemap\.xml/);
    // Images and public documents stay crawlable although /api/ is not.
    expect(text).toContain("Allow: /api/media/file/");
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

test.describe("Tender documents (Phase 6)", () => {
  const onHikview = (baseURL: string | undefined, path: string) => {
    const url = new URL(path, baseURL);
    url.hostname = "hikview.localhost";
    return url.toString();
  };

  test("each company has a documents page with its legal identity, linked from the footer", async ({ page, baseURL }) => {
    await page.goto(onHikview(baseURL, "/fr/documents"));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Documents administratifs");
    await expect(page.locator("aside")).toContainText("1667878K");
    await page.goto("/fr/documents");
    await expect(page.locator("aside")).toContainText("Growing Technologies");
    await expect(page.locator('footer a[href="/fr/documents"]')).toBeVisible();
  });

  test("the B2G page links to the documents", async ({ page, baseURL }) => {
    await page.goto(onHikview(baseURL, "/fr/services/integration-b2g"));
    await page.locator('main a[href="/fr/documents"]').click();
    await expect(page).toHaveURL(/\/fr\/documents$/);
  });

  test("visitors only get public documents through the API", async ({ request }) => {
    const response = await request.get("/api/company-documents?depth=0&limit=100");
    expect(response.ok()).toBeTruthy();
    const { docs } = (await response.json()) as { docs: { visibility: string; validUntil?: string | null }[] };
    for (const doc of docs) {
      expect(doc.visibility).toBe("public");
      if (doc.validUntil) expect(new Date(doc.validUntil).getTime()).toBeGreaterThan(Date.now() - 2 * 86_400_000);
    }
  });
});

test.describe("Coming soon (Phase 9)", () => {
  test("the home page shows the upcoming features, each leading to its placeholder", async ({ page }) => {
    await page.goto("/fr");
    const section = page.locator("section", { hasText: "Bientôt sur notre site" });
    await expect(section.getByText("Bientôt disponible")).toHaveCount(3);
    await section.locator('a[href="/fr/espace-client"]').click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Espace client");
    // Meanwhile, clients can already track their request.
    await expect(page.locator('main a[href="/fr/suivi"]')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("careers invite an open application by email to the site's own address", async ({ page, baseURL }) => {
    const url = new URL("/fr/carrieres", baseURL);
    url.hostname = "hikview.localhost";
    await page.goto(url.toString());
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Carrières");
    const mail = await page.locator('main a[href^="mailto:"]').getAttribute("href");
    expect(mail).toContain("Hikview%20Engineering");
  });

  test("placeholder pages stay out of the sitemap", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const path of ["/espace-client", "/carrieres", "/blog"]) expect(xml).not.toContain(`/fr${path}<`);
  });
});

test.describe("Header layout", () => {
  // French labels are the longest; the header must fit from tablet to wide desktop on both sites.
  for (const host of ["growing.localhost", "hikview.localhost", "localhost"]) {
    test(`${host}: the header never overflows the page`, async ({ page, baseURL }) => {
      const url = new URL("/fr/contact", baseURL);
      url.hostname = host;
      await page.goto(url.toString());
      for (const width of [768, 1024, 1180, 1280, 1440]) {
        await page.setViewportSize({ width, height: 800 });
        const overflow = await page.evaluate(() => {
          const bar = document.querySelector("header > div")!;
          return {
            header: bar.scrollWidth - bar.clientWidth,
            page: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          };
        });
        expect(overflow, `at ${width}px`).toEqual({ header: 0, page: 0 });
      }
    });
  }

  test("Hikview's home page leads to the quote form", async ({ page, baseURL }) => {
    const url = new URL("/fr", baseURL);
    url.hostname = "hikview.localhost";
    await page.goto(url.toString());
    // Hero and closing call to action (the header's own button is outside main).
    await expect(page.locator('main a[href="/fr/devis"]')).toHaveCount(2);
  });
});

test.describe("Group site (plain localhost)", () => {
  test("the home presents both companies, linking to their own sites", async ({ page, baseURL }) => {
    await page.goto(onHost(baseURL, "localhost", "/fr"));
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Sécuriser, connecter");
    const companies = page.locator("#filiales");
    await expect(companies.getByRole("heading", { level: 3 })).toHaveText(["Growing Technologies", "Hikview Engineering"]);
    await expect(companies.locator('a[href*="growing.localhost"][href$="/fr"]')).toBeVisible();
    await expect(companies.locator('a[href*="hikview.localhost"][href$="/fr"]')).toBeVisible();
    // The footer carries each company's legal identity.
    await expect(page.locator("footer")).toContainText("1667878K");
  });

  test("services are shown per company, in tabs", async ({ page, baseURL }) => {
    await page.goto(onHost(baseURL, "localhost", "/fr"));
    const services = page.locator("#services");
    await expect(services.getByRole("tab", { name: "Growing Technologies" })).toHaveAttribute("aria-selected", "true");
    await expect(services.getByRole("tabpanel")).toContainText("Pompage solaire");
    await services.getByRole("tab", { name: "Hikview Engineering" }).click();
    await expect(services.getByRole("tabpanel")).toContainText("Sécurité électronique");
    await expect(services.locator('a[href*="hikview.localhost"]').first()).toBeVisible();
  });

  test("the group's structured data lists both companies", async ({ page, baseURL }) => {
    await page.goto(onHost(baseURL, "localhost", "/fr"));
    const blocks = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));
    const group = blocks.find((b) => b["@type"] === "Organization");
    expect(group?.subOrganization?.map((o: { name: string }) => o.name)).toEqual(["Growing Technologies", "Hikview Engineering"]);
  });
});

