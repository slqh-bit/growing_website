import "server-only";
import type { Payload } from "payload";
import type { DevisRequest, SiteSetting } from "@/payload-types";
import { activityLabel, contactSummary, technicalSummary, type SummaryRow } from "./fields";
import { contactChannelOptions, labelOf } from "./options";

/**
 * New-lead notifications (devplan §6.3–6.4): team email (French summary),
 * client auto-reply (French), optional Telegram ping. Runs after the visitor
 * got their confirmation; each channel fails independently and is logged.
 */
export async function notifyNewLead(payload: Payload, lead: DevisRequest): Promise<void> {
  const settings = await payload.findGlobal({ slug: "site-settings", locale: "fr", depth: 0 });
  const channels: [string, () => Promise<unknown>][] = [
    ["team email", () => sendTeamEmail(payload, lead, settings)],
    ["client auto-reply", () => (lead.email ? sendClientEmail(payload, lead, settings) : Promise.resolve())],
    ["telegram", () => sendTelegram(lead)],
  ];
  const results = await Promise.allSettled(channels.map(([, send]) => send()));
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      payload.logger.error({ err: result.reason, msg: `Devis ${lead.reference}: ${channels[i]![0]} failed` });
    }
  });
}

// --- Helpers ---------------------------------------------------------------------

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const adminUrl = (lead: DevisRequest) => `${siteUrl()}/admin/collections/devis-requests/${lead.id}`;
const channelLabel = (lead: DevisRequest) => labelOf(contactChannelOptions, lead.preferredChannel, "fr");

function frenchSummary(lead: DevisRequest): { activity: string; technical: SummaryRow[]; contact: SummaryRow[] } {
  return {
    activity: activityLabel(lead.activity, "fr"),
    technical: technicalSummary(lead, "fr"),
    contact: contactSummary(lead, "fr"),
  };
}

function rowsHtml(rows: SummaryRow[]): string {
  return rows
    .map(
      (r) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#5b6b63;vertical-align:top;white-space:nowrap">${escapeHtml(r.label)}</td>` +
        `<td style="padding:6px 0;color:#14231c;font-weight:600;white-space:pre-line">${escapeHtml(r.value)}</td></tr>`,
    )
    .join("");
}

/** Minimal branded layout with inline styles (email clients ignore <style>). */
function layout(title: string, body: string, footer: string): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f3f7f4;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #dfe8e2">
<tr><td style="background:#16a34a;background-image:linear-gradient(135deg,#15803d,#16a34a 55%,#eab308);padding:22px 28px;color:#ffffff;font-size:20px;font-weight:bold">${title}</td></tr>
<tr><td style="padding:24px 28px;color:#14231c;font-size:15px;line-height:1.6">${body}</td></tr>
<tr><td style="padding:16px 28px;background:#f7faf8;color:#6b7b73;font-size:12px;line-height:1.5">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

function textRows(rows: SummaryRow[]): string {
  return rows.map((r) => `- ${r.label} : ${r.value}`).join("\n");
}

// --- Team email --------------------------------------------------------------------

async function sendTeamEmail(payload: Payload, lead: DevisRequest, settings: SiteSetting) {
  const to = process.env.DEVIS_NOTIFY_EMAIL || settings.email;
  const s = frenchSummary(lead);
  const ref = lead.reference ?? String(lead.id);

  const html = layout(
    `Nouvelle demande de devis · ${escapeHtml(ref)}`,
    `<p style="margin:0 0 16px"><strong>${escapeHtml(s.activity)}</strong> — ${escapeHtml(lead.fullName)}</p>
<h3 style="margin:18px 0 6px;font-size:14px;color:#15803d;text-transform:uppercase;letter-spacing:.04em">Besoins techniques</h3>
<table role="presentation" cellpadding="0" cellspacing="0">${rowsHtml(s.technical) || '<tr><td style="color:#6b7b73">—</td></tr>'}</table>
<h3 style="margin:18px 0 6px;font-size:14px;color:#15803d;text-transform:uppercase;letter-spacing:.04em">Contact</h3>
<table role="presentation" cellpadding="0" cellspacing="0">${rowsHtml(s.contact)}</table>
<p style="margin:24px 0 0"><a href="${escapeHtml(adminUrl(lead))}" style="display:inline-block;background:#15803d;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:bold">Ouvrir la demande dans l'admin</a></p>`,
    `Langue du client : ${escapeHtml((lead.locale ?? "fr").toUpperCase())} · Reçue le ${new Date(lead.createdAt).toLocaleString("fr-TN", { timeZone: "Africa/Tunis" })}`,
  );

  const text = `Nouvelle demande de devis ${ref}
${s.activity} — ${lead.fullName}

Besoins techniques :
${textRows(s.technical) || "-"}

Contact :
${textRows(s.contact)}

Admin : ${adminUrl(lead)}`;

  await payload.sendEmail({
    to,
    subject: `[Devis ${ref}] ${s.activity} — ${lead.fullName}`,
    html,
    text,
    ...(lead.email && { replyTo: lead.email }),
  });
}

// --- Client auto-reply (French, devplan §6.3) --------------------------------------

async function sendClientEmail(payload: Payload, lead: DevisRequest, settings: SiteSetting) {
  const ref = lead.reference ?? String(lead.id);
  const activity = activityLabel(lead.activity, "fr");
  const channel = channelLabel(lead);
  // Only fixed facts are echoed back (no free-text fields), so the form can't
  // be abused to relay arbitrary content to third-party addresses.
  const html = layout(
    "Nous avons bien reçu votre demande",
    `<p style="margin:0 0 12px">Bonjour ${escapeHtml(lead.fullName)},</p>
<p style="margin:0 0 12px">Merci pour votre demande de devis <strong>${escapeHtml(activity)}</strong>. Notre équipe l'étudie et vous recontacte sous <strong>48 h ouvrées</strong> — canal souhaité : ${escapeHtml(channel)}.</p>
<p style="margin:0 0 12px">Votre référence : <strong style="font-family:monospace;font-size:16px">${escapeHtml(ref)}</strong></p>
<p style="margin:0">Pour toute question : ${escapeHtml(settings.phone)} · ${escapeHtml(settings.email)}</p>`,
    `${escapeHtml(settings.legalName)} — ${escapeHtml(settings.address)}<br>Matricule fiscal : ${escapeHtml(settings.matriculeFiscal)}<br>Ce message est envoyé automatiquement suite à votre demande sur notre site.`,
  );
  const text = `Bonjour ${lead.fullName},

Merci pour votre demande de devis (${activity}). Notre équipe l'étudie et vous recontacte sous 48 h ouvrées — canal souhaité : ${channel}.

Votre référence : ${ref}

Pour toute question : ${settings.phone} · ${settings.email}

${settings.legalName} — ${settings.address}`;

  await payload.sendEmail({
    to: lead.email!,
    subject: `Votre demande de devis ${ref} — ${settings.companyName}`,
    html,
    text,
  });
}

// --- Telegram (optional) ------------------------------------------------------------

async function sendTelegram(lead: DevisRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const s = frenchSummary(lead);
  const line = (r: SummaryRow) => `• ${escapeHtml(r.label)} : <b>${escapeHtml(r.value)}</b>`;
  const text = [
    `🔔 <b>Nouvelle demande de devis</b> <code>${escapeHtml(lead.reference ?? "")}</code>`,
    `<b>${escapeHtml(s.activity)}</b> — ${escapeHtml(lead.fullName)}`,
    "",
    ...s.technical.map(line),
    "",
    ...s.contact.map(line),
    "",
    `<a href="${escapeHtml(adminUrl(lead))}">Ouvrir dans l'admin</a>`,
  ].join("\n");

  // TELEGRAM_API_URL allows a self-hosted Bot API server (defaults to Telegram's).
  const base = (process.env.TELEGRAM_API_URL || "https://api.telegram.org").replace(/\/$/, "");
  const res = await fetch(`${base}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`Telegram API responded ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
