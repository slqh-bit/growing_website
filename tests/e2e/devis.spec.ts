import { expect, test, type Page } from "@playwright/test";

// A distinct client IP per test keeps the per-IP rate limit (5 / 15 min) out
// of the way; the app reads X-Real-IP, which Caddy sets in production.
let ipCounter = 0;
test.beforeEach(async ({ context }) => {
  ipCounter += 1;
  await context.setExtraHTTPHeaders({ "X-Real-IP": `203.0.113.${(Date.now() + ipCounter) % 250}` });
});

const next = (page: Page, label: string) => page.getByRole("button", { name: label }).click();
const fieldError = (page: Page, id: string) => page.locator(`#devis-${id}-error`);

test("FR: a complete pompage request reaches the success screen", async ({ page }) => {
  test.slow(); // the server rejects forms filled in under 5 s (spam trap)
  await page.goto("/fr/devis");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuetext", /Étape 1\/4/);

  // Step 1: activity is required.
  await next(page, "Continuer");
  await expect(fieldError(page, "service")).toHaveText("Choisissez une activité pour continuer.");
  await page.locator("form").getByText("Pompage solaire", { exact: true }).click();
  await next(page, "Continuer");

  // Step 2: technical needs, Arabic-Indic digits accepted.
  await expect(page.getByRole("heading", { level: 2, name: "Besoins techniques" })).toBeVisible();
  await next(page, "Continuer");
  await expect(fieldError(page, "answers-waterSource")).toHaveText("Ce champ est obligatoire.");
  await page.selectOption("#devis-answers-waterSource", "forage");
  await page.fill("#devis-answers-flowM3PerDay", "٤٠");
  await page.fill("#devis-answers-depthM", "80");
  await next(page, "Continuer");

  // Step 3: contact.
  await page.fill("#devis-fullName", "Test E2E");
  await page.fill("#devis-phone", "12");
  await next(page, "Continuer");
  await expect(fieldError(page, "phone")).toContainText("Numéro invalide");
  await page.fill("#devis-phone", "98 123 456");
  await page.selectOption("#devis-region", "kasserine");
  await next(page, "Continuer");

  // Step 4: review shows normalized values; consent required.
  const form = page.locator("form");
  await expect(form).toContainText("40 m³/jour");
  await expect(form).toContainText("+21698123456");
  await page.getByRole("button", { name: "Envoyer ma demande" }).click();
  await expect(fieldError(page, "consent")).toHaveText(
    "Votre accord est nécessaire pour traiter la demande.",
  );
  await page.check("#devis-consent");

  await page.waitForTimeout(5_200);
  await page.getByRole("button", { name: "Envoyer ma demande" }).click();
  await expect(page.getByRole("heading", { name: "Demande envoyée !" })).toBeVisible({
    timeout: 15_000,
  });
  const reference = (await page.locator("span.font-mono").textContent())!.trim();
  expect(reference).toMatch(/^GT-\d{6}-[0-9A-F]{4}$/);

  // Tracking: the success link pre-fills the reference; the phone must match.
  // Scoped to the page: the header also links to /suivi.
  await page.locator("#main").getByRole("link", { name: "Suivre ma demande" }).click();
  await expect(page).toHaveURL(new RegExp(`/fr/suivi\\?ref=${reference}$`));
  await expect(page.locator("#track-reference")).toHaveValue(reference);
  await page.fill("#track-phone", "22 333 444");
  await page.getByRole("button", { name: "Voir l'avancement" }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText(
    "Aucune demande ne correspond",
  );
  await page.fill("#track-phone", "98123456");
  await page.getByRole("button", { name: "Voir l'avancement" }).click();
  await expect(page.getByRole("heading", { level: 2 })).toContainText(reference);
  await expect(page.locator('li[aria-current="step"]')).toContainText("Demande reçue");
});

test("honeypot is not rendered, so autofill can't fill it", async ({ page }) => {
  // A sr-only field named "website" was autofilled for real visitors, whose
  // leads were then silently dropped as spam.
  await page.goto("/fr/devis");
  const honeypot = page.locator('form input[tabindex="-1"][type="text"]');
  await expect(honeypot).toHaveCount(1);
  await expect(honeypot).toBeHidden();
  await expect(honeypot).not.toHaveAttribute("name", /web|url|site|mail|name|phone/i);
});

test("AR: the form is right-to-left and translated", async ({ page }) => {
  await page.goto("/ar/devis");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuetext", /الخطوة 1\/4/);
  await next(page, "متابعة");
  await expect(fieldError(page, "service")).toHaveText("اختر نشاطاً للمتابعة.");
});

test("questions follow the admin-built form: street lighting asks for light points", async ({ page }) => {
  await page.goto("/fr/devis?service=site-isole");
  // Preselected from the service page link.
  await next(page, "Continuer");
  await expect(page.getByRole("heading", { level: 2, name: "Besoins techniques" })).toBeVisible();
  await next(page, "Continuer");
  await expect(fieldError(page, "answers-subtype")).toHaveText("Ce champ est obligatoire.");

  await page.locator("form").getByText("Éclairage public solaire", { exact: true }).click();
  await expect(page.locator("#devis-answers-lightPoints")).toBeVisible();
  await expect(page.locator("#devis-answers-dailyConsumptionKwh")).toHaveCount(0);
  await next(page, "Continuer");
  await expect(fieldError(page, "answers-lightPoints")).toHaveText("Ce champ est obligatoire.");

  await page.locator("form").getByText("Site isolé (maison, ferme, relais…)", { exact: true }).click();
  await expect(page.locator("#devis-answers-dailyConsumptionKwh")).toBeVisible();
  await expect(page.locator("#devis-answers-lightPoints")).toHaveCount(0);
});

test("a service's quote button preselects it in the form", async ({ page }) => {
  await page.goto("/fr/services/centrale-photovoltaique");
  await page.locator('main a[href="/fr/devis?service=centrale-photovoltaique"]').first().click();
  await expect(page).toHaveURL(/\/fr\/devis\?service=centrale-photovoltaique$/);
  await next(page, "Continuer");
  await expect(page.locator("form")).toContainText("Régime du projet");
});
