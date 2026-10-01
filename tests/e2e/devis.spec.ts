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

// --- Hikview (plan §6.3): its own forms, files and site visit, HE- references -------

const onHikview = (baseURL: string | undefined, path: string) => {
  const url = new URL(path, baseURL);
  url.hostname = "hikview.localhost"; // Chromium resolves *.localhost to the loopback address
  return url.toString();
};

/** A small but well-formed PDF (Payload checks the header, xref and %%EOF). */
const pdf = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nxref\n0 2\n0000000000 65535 f \n0000000009 00000 n \ntrailer<</Size 2/Root 1 0 R>>\nstartxref\n45\n%%EOF\n",
  "latin1",
);

test("Hikview: a public-sector request carries its tender specs and asks for a site visit", async ({ page, baseURL }) => {
  test.slow();
  await page.goto(onHikview(baseURL, "/fr/devis?service=integration-b2g"));
  await next(page, "Continuer");

  // Step 2: the B2G form, with its own attachments label.
  const form = page.locator("form");
  await expect(form).toContainText("Institution / organisme");
  await expect(form).toContainText("Cahier des charges (CDC)");
  await next(page, "Continuer");
  await expect(fieldError(page, "answers-institution")).toHaveText("Ce champ est obligatoire.");
  await page.fill("#devis-answers-institution", "Commune de Test E2E");
  await page.fill("#devis-answers-description", "Vidéoprotection du centre-ville et contrôle d'accès de la mairie.");
  await page.fill("#devis-answers-deadline", "2026-12-31");

  // Files: refused at once when the type is wrong; a fake image only fails on the server.
  const files = page.locator("#devis-attachments");
  await files.setInputFiles({ name: "setup.exe", mimeType: "application/octet-stream", buffer: Buffer.from("MZ") });
  await expect(fieldError(page, "attachments")).toContainText("Format non accepté");
  await files.setInputFiles([
    { name: "cdc.pdf", mimeType: "application/pdf", buffer: pdf },
    { name: "photo.jpg", mimeType: "image/jpeg", buffer: Buffer.from("<html><script>alert(1)</script></html>") },
  ]);
  await expect(fieldError(page, "attachments")).toHaveCount(0);
  await expect(form.getByRole("listitem")).toHaveCount(2);
  await next(page, "Continuer");

  // Step 3: contact + site visit.
  await page.fill("#devis-fullName", "Test E2E Hikview");
  await page.fill("#devis-phone", "22 333 444");
  await page.selectOption("#devis-region", "kasserine");
  await page.check("#devis-siteVisit");
  await next(page, "Continuer");

  // Step 4: the review lists the files and the visit.
  await expect(form).toContainText("Cahier des charges (CDC)");
  await expect(form).toContainText("cdc.pdf");
  await expect(form).toContainText("Visite technique sur site");
  await expect(form).toContainText("Souhaitée");
  await page.check("#devis-consent");
  await page.waitForTimeout(5_200);
  await page.getByRole("button", { name: "Envoyer ma demande" }).click();

  // The server reads the files: the fake image sends the client back to step 2.
  await expect(page.getByRole("heading", { level: 2, name: "Besoins techniques" })).toBeVisible({ timeout: 15_000 });
  await expect(fieldError(page, "attachments")).toContainText("Format non accepté");
  await page.getByRole("button", { name: "Retirer photo.jpg" }).click();
  await next(page, "Continuer");
  await next(page, "Continuer");
  await page.getByRole("button", { name: "Envoyer ma demande" }).click();

  await expect(page.getByRole("heading", { name: "Demande envoyée !" })).toBeVisible({ timeout: 15_000 });
  const reference = (await page.locator("span.font-mono").textContent())!.trim();
  expect(reference).toMatch(/^HE-\d{6}-[0-9A-F]{4}$/);
});

test("Hikview: area pages open the quote form, sub-services preselect theirs", async ({ page, baseURL }) => {
  await page.goto(onHikview(baseURL, "/fr/services/securite-electronique"));
  await page.locator('main a[href="/fr/devis"]').first().click();
  await expect(page.locator("form")).toContainText("Vidéosurveillance");
  await expect(page.locator("form")).toContainText("Sécurité incendie");

  await page.goto(onHikview(baseURL, "/fr/services/securite-electronique/securite-incendie"));
  await page.locator('main a[href="/fr/devis?service=securite-incendie"]').first().click();
  await next(page, "Continuer");
  await expect(page.locator("form")).toContainText("Type d'établissement");
});

