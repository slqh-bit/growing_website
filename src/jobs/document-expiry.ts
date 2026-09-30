import type { Payload, TaskConfig } from "payload";
import type { CompanyDocument, Site } from "../payload-types";
import {
  EXPIRY_WARNING_DAYS,
  daysLeft,
  documentTypes,
  expiryLevel,
  needsAlert,
  type ExpiryLevel,
} from "../lib/documents";
import { buttonHtml, emailBrand, escapeHtml, fromOf, layout, siteUrl } from "../lib/devis/email";
import { sendTelegram, teamEmails } from "../lib/team-notify";

/**
 * Company-document expiry alerts (plan Phase 6). Once a day, each site's team
 * (Sites → Demandes de devis: e-mails, Telegram) gets one message listing its
 * documents that newly reached "expires within 30 days", "within 7 days" or
 * "expired". Each document remembers the last level it was alerted for, so a
 * document is announced at most three times; a new validity date resets it.
 */

type Due = { doc: CompanyDocument; level: ExpiryLevel; days: number };

const typeLabel = (type: string) => documentTypes.find((t) => t.value === type)?.label.fr ?? type;
const dateFr = (iso: string) =>
  new Intl.DateTimeFormat("fr-TN", { dateStyle: "long", timeZone: "Africa/Tunis" }).format(new Date(iso));
const status = ({ level, days }: Due) =>
  level === "expired" ? "EXPIRÉ" : days === 0 ? "expire aujourd'hui" : `expire dans ${days} jour${days > 1 ? "s" : ""}`;
const adminLink = (doc: CompanyDocument) => `${siteUrl()}/admin/collections/company-documents/${doc.id}`;

async function alertSite(payload: Payload, site: Site, due: Due[]): Promise<void> {
  const brand = emailBrand(site);
  const expired = due.filter((d) => d.level === "expired").length;
  const subject =
    `[Documents] ${due.length} document${due.length > 1 ? "s" : ""} à renouveler — ${site.companyName}` +
    (expired > 0 ? ` (${expired} expiré${expired > 1 ? "s" : ""})` : "");

  const rows = due
    .map(
      (d) =>
        `<tr><td style="padding:8px 12px 8px 0;vertical-align:top"><a href="${escapeHtml(adminLink(d.doc))}" style="color:${brand.primary};font-weight:600">${escapeHtml(d.doc.title)}</a><br><span style="color:#5b6b63;font-size:13px">${escapeHtml(typeLabel(d.doc.type))}</span></td>` +
        `<td style="padding:8px 0;vertical-align:top;white-space:nowrap">${escapeHtml(dateFr(d.doc.validUntil!))}<br><strong style="color:${d.level === "valid" || d.level === "soon" ? "#9a6700" : "#b42318"}">${escapeHtml(status(d))}</strong></td></tr>`,
    )
    .join("");
  const html = layout(
    "Documents administratifs à renouveler",
    `<p style="margin:0 0 12px">Ces documents arrivent à expiration. Tant qu'ils ne sont pas renouvelés, les documents expirés ne sont plus proposés sur la page Documents du site.</p>
<table role="presentation" cellpadding="0" cellspacing="0">${rows}</table>
<p style="margin:20px 0 0">${buttonHtml(`${siteUrl()}/admin/collections/company-documents`, "Ouvrir les documents dans l'admin", brand)}</p>`,
    `${escapeHtml(site.companyName)} · Alerte envoyée ${EXPIRY_WARNING_DAYS} jours puis 7 jours avant l'expiration, et à l'expiration.`,
    "fr",
    brand,
  );
  const text = `Documents administratifs à renouveler (${site.companyName})

${due.map((d) => `- ${d.doc.title} (${typeLabel(d.doc.type)}) : valide jusqu'au ${dateFr(d.doc.validUntil!)}, ${status(d)}\n  ${adminLink(d.doc)}`).join("\n")}`;

  const telegram = [
    `📄 <b>Documents à renouveler</b> · ${escapeHtml(site.companyName)}`,
    "",
    ...due.map((d) => `• ${escapeHtml(d.doc.title)} : <b>${escapeHtml(status(d))}</b> (${escapeHtml(dateFr(d.doc.validUntil!))})`),
    "",
    `<a href="${escapeHtml(`${siteUrl()}/admin/collections/company-documents`)}">Ouvrir dans l'admin</a>`,
  ].join("\n");

  // The email is the channel of record: if it fails, the alert is retried tomorrow.
  await payload.sendEmail({ from: fromOf(site), to: teamEmails(site), subject, html, text });
  await sendTelegram(site, telegram).catch((err) =>
    payload.logger.error({ err, msg: `Document expiry alert: Telegram failed for ${site.key}` }),
  );
}

/** Sends the due alerts; returns how many documents were announced. */
export async function sendDocumentExpiryAlerts(payload: Payload, now = new Date()): Promise<number> {
  const horizon = new Date(now.getTime() + (EXPIRY_WARNING_DAYS + 1) * 24 * 60 * 60 * 1000);
  const { docs } = await payload.find({
    collection: "company-documents",
    where: { validUntil: { less_than_equal: horizon.toISOString() } },
    depth: 0,
    limit: 1000,
    pagination: false,
    overrideAccess: true,
  });

  const bySite = new Map<number, Due[]>();
  for (const doc of docs) {
    const level = expiryLevel(doc.validUntil, now);
    if (!needsAlert(level, doc.alertLevel)) continue;
    const siteId = typeof doc.site === "object" ? doc.site.id : doc.site;
    bySite.set(siteId, [...(bySite.get(siteId) ?? []), { doc, level, days: daysLeft(doc.validUntil, now) ?? 0 }]);
  }

  let alerted = 0;
  for (const [siteId, due] of bySite) {
    try {
      const site = await payload.findByID({ collection: "sites", id: siteId, locale: "fr", depth: 0, overrideAccess: true });
      due.sort((a, b) => a.days - b.days);
      await alertSite(payload, site, due);
      for (const { doc, level } of due) {
        await payload.update({
          collection: "company-documents",
          id: doc.id,
          data: { alertLevel: level },
          depth: 0,
          overrideAccess: true,
          context: { disableRevalidate: true },
        });
      }
      alerted += due.length;
    } catch (err) {
      payload.logger.error({ err, msg: `Document expiry alert failed for site ${siteId}` });
    }
  }
  if (alerted > 0) payload.logger.info(`Document expiry alerts: ${alerted} document(s) announced.`);
  return alerted;
}

/**
 * Daily at 07:00 in the server's time zone (TZ, Africa/Tunis in
 * deploy/docker-compose.yml). Queued by the scheduler and run by the "daily"
 * autoRun in payload.config.ts.
 */
export const documentExpiryTask: TaskConfig<"documentExpiryAlerts"> = {
  slug: "documentExpiryAlerts",
  label: "Alertes d'expiration des documents",
  schedule: [{ cron: "0 0 7 * * *", queue: "daily" }],
  outputSchema: [{ name: "alerted", type: "number", required: true }],
  retries: 2,
  handler: async ({ req }) => ({ output: { alerted: await sendDocumentExpiryAlerts(req.payload) } }),
};
