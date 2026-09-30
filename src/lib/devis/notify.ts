import "server-only";
import { access } from "fs/promises";
import path from "path";
import type { Payload } from "payload";
import type { DevisAttachment, DevisRequest, Site } from "@/payload-types";
import { findLeadSite } from "../../cms/sites";
import { activityLabel, contactSummary, technicalSummary, type SummaryRow } from "./fields";
import { answersSummary, pick, type Answers, type FormSnapshot } from "./form-def";
import { contactChannelOptions, labelOf } from "./options";
import { buttonHtml, emailBrand, escapeHtml, fromOf, layout, siteUrl, trackingUrl, type EmailBrand } from "./email";
import { attachmentsDir } from "./quote-files";

/**
 * New-lead notifications (plan §6.4): team email (French summary) to the
 * site's team, client auto-reply (French) branded with the site, Telegram ping
 * to the site's group. Runs after the visitor got their confirmation; each
 * channel fails independently and is logged.
 */
export async function notifyNewLead(payload: Payload, lead: DevisRequest): Promise<void> {
  const site = await findLeadSite(payload, "fr", lead);
  const files = await leadFiles(payload, lead);
  const channels: [string, () => Promise<unknown>][] = [
    ["team email", () => sendTeamEmail(payload, lead, site, files)],
    ["client auto-reply", () => (lead.email ? sendClientEmail(payload, lead, site) : Promise.resolve())],
    ["telegram", () => sendTelegram(lead, site, files)],
  ];
  const results = await Promise.allSettled(channels.map(([, send]) => send()));
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      payload.logger.error({ err: result.reason, msg: `Devis ${lead.reference}: ${channels[i]![0]} failed` });
    }
  });
}

// --- Routing (Sites → Demandes de devis) -------------------------------------------

/** The site's team addresses; the default site also falls back to DEVIS_NOTIFY_EMAIL; else the site's email. */
function teamEmails(site: Site): string[] {
  const listed = (site.notify?.emails ?? []).map((e) => e.email).filter(Boolean);
  if (listed.length > 0) return listed;
  if (site.isDefault && process.env.DEVIS_NOTIFY_EMAIL) return [process.env.DEVIS_NOTIFY_EMAIL];
  return [site.email];
}

/** The site's Telegram group; the default site also falls back to TELEGRAM_CHAT_ID. */
function telegramChat(site: Site): string | undefined {
  return site.notify?.telegramChatId || (site.isDefault ? process.env.TELEGRAM_CHAT_ID : undefined) || undefined;
}

// --- Helpers ---------------------------------------------------------------------

const adminUrl = (lead: DevisRequest) => `${siteUrl()}/admin/collections/devis-requests/${lead.id}`;
const channelLabel = (lead: DevisRequest) => labelOf(contactChannelOptions, lead.preferredChannel, "fr");

/** The service and technical answers in French: from the form snapshot, or the legacy typed groups. */
function frenchSummary(lead: DevisRequest): { activity: string; technical: SummaryRow[]; contact: SummaryRow[] } {
  const snapshot = lead.formSnapshot as FormSnapshot | null | undefined;
  const contact = contactSummary(lead, "fr");
  if (snapshot?.questions) {
    return {
      activity: pick(snapshot.serviceTitle, "fr"),
      technical: answersSummary(snapshot, (lead.technicalDetails ?? {}) as Answers, "fr"),
      contact,
    };
  }
  const activity = lead.activity ?? "raccorde";
  return {
    activity: activityLabel(activity, "fr"),
    technical: technicalSummary({ ...lead, activity }, "fr"),
    contact,
  };
}

/** The files the client attached (DevisAttachments). */
async function leadFiles(payload: Payload, lead: DevisRequest): Promise<DevisAttachment[]> {
  const ids = (lead.attachments ?? []).map((a) => (typeof a === "object" ? a.id : a));
  if (ids.length === 0) return [];
  const { docs } = await payload.find({
    collection: "devis-attachments",
    where: { id: { in: ids } },
    depth: 0,
    limit: ids.length,
    overrideAccess: true,
  });
  return docs;
}

/** Attached to the team email while they stay small enough to be delivered; else linked from the admin. */
const MAX_EMAILED_BYTES = 10 * 1024 * 1024;

function filesRow(files: DevisAttachment[]): SummaryRow[] {
  return files.length > 0 ? [{ label: "Pièces jointes", value: files.map((f) => f.filename ?? "").join("\n") }] : [];
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

function textRows(rows: SummaryRow[]): string {
  return rows.map((r) => `- ${r.label} : ${r.value}`).join("\n");
}

const heading = (text: string, brand: EmailBrand) =>
  `<h3 style="margin:18px 0 6px;font-size:14px;color:${brand.primary};text-transform:uppercase;letter-spacing:.04em">${escapeHtml(text)}</h3>`;

// --- Team email --------------------------------------------------------------------

async function sendTeamEmail(payload: Payload, lead: DevisRequest, site: Site, files: DevisAttachment[]) {
  const s = frenchSummary(lead);
  const technical = [...s.technical, ...filesRow(files)];
  const ref = lead.reference ?? String(lead.id);
  const brand = emailBrand(site);
  const totalBytes = files.reduce((sum, f) => sum + (f.filesize ?? 0), 0);
  // A file missing on disk must not cost the team the lead email: it is left out.
  const onDisk = await Promise.all(
    files.map(async (f) => {
      const filePath = f.filename ? path.resolve(attachmentsDir, f.filename) : null;
      return filePath && (await access(filePath).then(() => true, () => false))
        ? [{ filename: f.filename!, path: filePath, contentType: f.mimeType ?? undefined }]
        : [];
    }),
  );
  const attachments = totalBytes <= MAX_EMAILED_BYTES ? onDisk.flat() : [];
  const filesNote =
    files.length > 0 && attachments.length === 0
      ? `<p style="margin:12px 0 0;color:#5b6b63">Pièces jointes trop lourdes pour l'e-mail : ouvrez-les dans l'admin.</p>`
      : "";

  const html = layout(
    `Nouvelle demande de devis · ${escapeHtml(ref)}`,
    `<p style="margin:0 0 16px"><strong>${escapeHtml(s.activity)}</strong> — ${escapeHtml(lead.fullName)}</p>
${heading("Besoins techniques", brand)}
<table role="presentation" cellpadding="0" cellspacing="0">${rowsHtml(technical) || '<tr><td style="color:#6b7b73">—</td></tr>'}</table>
${filesNote}
${heading("Contact", brand)}
<table role="presentation" cellpadding="0" cellspacing="0">${rowsHtml(s.contact)}</table>
<p style="margin:24px 0 0">${buttonHtml(adminUrl(lead), "Ouvrir la demande dans l'admin", brand)}</p>`,
    `${escapeHtml(site.companyName)} · Langue du client : ${escapeHtml((lead.locale ?? "fr").toUpperCase())} · Reçue le ${new Date(lead.createdAt).toLocaleString("fr-TN", { timeZone: "Africa/Tunis" })}`,
    "fr",
    brand,
  );

  const text = `Nouvelle demande de devis ${ref} (${site.companyName})
${s.activity} — ${lead.fullName}

Besoins techniques :
${textRows(technical) || "-"}

Contact :
${textRows(s.contact)}

Admin : ${adminUrl(lead)}`;

  await payload.sendEmail({
    from: fromOf(site),
    to: teamEmails(site),
    subject: `[Devis ${ref}] ${s.activity} — ${lead.fullName}`,
    html,
    text,
    attachments,
    ...(lead.email && { replyTo: lead.email }),
  });
}

// --- Client auto-reply (French) ------------------------------------------------------

async function sendClientEmail(payload: Payload, lead: DevisRequest, site: Site) {
  const ref = lead.reference ?? String(lead.id);
  const { activity } = frenchSummary(lead);
  const channel = channelLabel(lead);
  const brand = emailBrand(site);
  const track = trackingUrl(lead, site);
  // Only fixed facts are echoed back (no free-text fields), so the form can't
  // be abused to relay arbitrary content to third-party addresses.
  const html = layout(
    "Nous avons bien reçu votre demande",
    `<p style="margin:0 0 12px">Bonjour ${escapeHtml(lead.fullName)},</p>
<p style="margin:0 0 12px">Merci pour votre demande de devis <strong>${escapeHtml(activity)}</strong>. Notre équipe l'étudie et vous recontacte sous <strong>48 h ouvrées</strong> — canal souhaité : ${escapeHtml(channel)}.</p>
<p style="margin:0 0 12px">Votre référence : <strong style="font-family:monospace;font-size:16px">${escapeHtml(ref)}</strong></p>
<p style="margin:0 0 16px">${buttonHtml(track, "Suivre ma demande", brand)}</p>
<p style="margin:0">Pour toute question : ${escapeHtml(site.phone)} · ${escapeHtml(site.email)}</p>`,
    `${escapeHtml(site.legalName)} — ${escapeHtml(site.address)}<br>Matricule fiscal : ${escapeHtml(site.matriculeFiscal)}<br>Ce message est envoyé automatiquement suite à votre demande sur notre site.`,
    "fr",
    brand,
  );
  const text = `Bonjour ${lead.fullName},

Merci pour votre demande de devis (${activity}). Notre équipe l'étudie et vous recontacte sous 48 h ouvrées — canal souhaité : ${channel}.

Votre référence : ${ref}
Suivre votre demande : ${track}

Pour toute question : ${site.phone} · ${site.email}

${site.legalName} — ${site.address}`;

  await payload.sendEmail({
    from: fromOf(site),
    to: lead.email!,
    subject: `Votre demande de devis ${ref} — ${site.companyName}`,
    html,
    text,
  });
}

// --- Telegram (optional) ------------------------------------------------------------

async function sendTelegram(lead: DevisRequest, site: Site, files: DevisAttachment[]) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = telegramChat(site);
  if (!token || !chatId) return;

  const s = frenchSummary(lead);
  const line = (r: SummaryRow) => `• ${escapeHtml(r.label)} : <b>${escapeHtml(r.value)}</b>`;
  const text = [
    `🔔 <b>Nouvelle demande de devis</b> <code>${escapeHtml(lead.reference ?? "")}</code> · ${escapeHtml(site.companyName)}`,
    `<b>${escapeHtml(s.activity)}</b> — ${escapeHtml(lead.fullName)}`,
    "",
    ...s.technical.map(line),
    ...(files.length > 0 ? [`📎 ${files.length} pièce${files.length > 1 ? "s" : ""} jointe${files.length > 1 ? "s" : ""}`] : []),
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
