/**
 * Where a site's team is notified (Sites → Demandes de devis): quote requests
 * (./devis/notify) and company-document expiry alerts (src/jobs). Not
 * server-only, so the Payload job can use it outside Next.js; never import it
 * from client code (it reads the Telegram bot token).
 */
import type { Site } from "@/payload-types";

/** The site's team addresses; the default site also falls back to DEVIS_NOTIFY_EMAIL; else the site's email. */
export function teamEmails(site: Site): string[] {
  const listed = (site.notify?.emails ?? []).map((e) => e.email).filter(Boolean);
  if (listed.length > 0) return listed;
  if (site.isDefault && process.env.DEVIS_NOTIFY_EMAIL) return [process.env.DEVIS_NOTIFY_EMAIL];
  return [site.email];
}

/** The site's Telegram group; the default site also falls back to TELEGRAM_CHAT_ID. */
export function telegramChat(site: Site): string | undefined {
  return site.notify?.telegramChatId || (site.isDefault ? process.env.TELEGRAM_CHAT_ID : undefined) || undefined;
}

/**
 * Posts an HTML message to the site's Telegram group. Does nothing (returns
 * false) when no bot token or group is configured; throws on an API error.
 */
export async function sendTelegram(site: Site, html: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = telegramChat(site);
  if (!token || !chatId) return false;

  // TELEGRAM_API_URL allows a self-hosted Bot API server (defaults to Telegram's).
  const base = (process.env.TELEGRAM_API_URL || "https://api.telegram.org").replace(/\/$/, "");
  const res = await fetch(`${base}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: html, parse_mode: "HTML", disable_web_page_preview: true }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`Telegram API responded ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return true;
}
