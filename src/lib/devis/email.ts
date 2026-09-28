/**
 * Email building blocks shared by the lead notifications (./notify) and the
 * client status emails. Unlike ./notify it holds no secrets and is not
 * server-only, so the DevisRequests collection hook can use it even when the
 * Payload CLI (not a Next.js server) changes a status.
 */
import type { Payload } from "payload";
import type { DevisRequest } from "@/payload-types";
import type { DevisStatus } from "./tracking";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const siteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
export type Lang = "fr" | "ar" | "en";
export const leadLang = (lead: DevisRequest): Lang =>
  lead.locale === "ar" || lead.locale === "en" ? lead.locale : "fr";
/** Client tracking page, reference pre-filled (the phone is still required there). */
export const trackingUrl = (lead: DevisRequest) =>
  `${siteUrl()}/${leadLang(lead)}/suivi?ref=${encodeURIComponent(lead.reference ?? "")}`;

export function buttonHtml(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:#15803d;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:bold">${escapeHtml(label)}</a>`;
}

/** Minimal branded layout with inline styles (email clients ignore <style>). */
export function layout(title: string, body: string, footer: string, lang: Lang = "fr"): string {
  const dir = lang === "ar" ? "rtl" : "ltr";
  return `<!doctype html><html lang="${lang}" dir="${dir}"><body dir="${dir}" style="margin:0;background:#f3f7f4;font-family:Arial,Helvetica,sans-serif;text-align:${dir === "rtl" ? "right" : "left"}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #dfe8e2">
<tr><td style="background:#16a34a;background-image:linear-gradient(135deg,#15803d,#16a34a 55%,#eab308);padding:22px 28px;color:#ffffff;font-size:20px;font-weight:bold">${title}</td></tr>
<tr><td style="padding:24px 28px;color:#14231c;font-size:15px;line-height:1.6">${body}</td></tr>
<tr><td style="padding:16px 28px;background:#f7faf8;color:#6b7b73;font-size:12px;line-height:1.5">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

// --- Status change (client's language) ---------------------------------------------

const statusCopy: Record<
  Lang,
  {
    hello: (name: string) => string;
    subject: Partial<Record<DevisStatus, (ref: string) => string>>;
    title: Partial<Record<DevisStatus, string>>;
    body: Partial<Record<DevisStatus, string>>;
    reference: string;
    track: string;
    questions: string;
    auto: string;
  }
> = {
  fr: {
    hello: (n) => `Bonjour ${n},`,
    subject: {
      "devis-envoye": (r) => `Votre devis est prêt — ${r}`,
      gagne: (r) => `Votre projet est confirmé — ${r}`,
    },
    title: { "devis-envoye": "Votre devis est prêt", gagne: "Votre projet est confirmé" },
    body: {
      "devis-envoye":
        "Notre devis pour votre projet vous a été transmis. N'hésitez pas à nous contacter pour toute question ou pour en discuter.",
      gagne:
        "Merci pour votre confiance ! Votre projet est confirmé ; notre équipe vous contacte pour planifier la suite.",
    },
    reference: "Votre référence",
    track: "Suivre ma demande",
    questions: "Pour toute question",
    auto: "Ce message est envoyé automatiquement suite à la mise à jour de votre demande.",
  },
  en: {
    hello: (n) => `Hello ${n},`,
    subject: {
      "devis-envoye": (r) => `Your quote is ready — ${r}`,
      gagne: (r) => `Your project is confirmed — ${r}`,
    },
    title: { "devis-envoye": "Your quote is ready", gagne: "Your project is confirmed" },
    body: {
      "devis-envoye":
        "Our quote for your project has been sent to you. Feel free to contact us with any question or to discuss it.",
      gagne:
        "Thank you for your trust! Your project is confirmed; our team will contact you to plan the next steps.",
    },
    reference: "Your reference",
    track: "Track my request",
    questions: "Any question",
    auto: "This message is sent automatically following an update to your request.",
  },
  ar: {
    hello: (n) => `مرحباً ${n}،`,
    subject: {
      "devis-envoye": (r) => `تسعيرتك جاهزة — ${r}`,
      gagne: (r) => `تمّ تأكيد مشروعك — ${r}`,
    },
    title: { "devis-envoye": "تسعيرتك جاهزة", gagne: "تمّ تأكيد مشروعك" },
    body: {
      "devis-envoye":
        "لقد أرسلنا إليك تسعيرة مشروعك. لا تتردّد في التواصل معنا لأيّ استفسار أو لمناقشتها.",
      gagne: "شكراً على ثقتك! تمّ تأكيد مشروعك، وسيتواصل معك فريقنا لتخطيط المراحل القادمة.",
    },
    reference: "مرجعك",
    track: "متابعة طلبي",
    questions: "لأيّ استفسار",
    auto: "هذه الرسالة مُرسلة تلقائياً إثر تحديث طلبك.",
  },
};

/** Tells the client their lead reached a notified status (see clientNotifiedStatuses). */
export async function notifyStatusChange(payload: Payload, lead: DevisRequest): Promise<void> {
  const status = lead.status as DevisStatus;
  const lang = leadLang(lead);
  const copy = statusCopy[lang];
  const subject = copy.subject[status];
  if (!lead.email || !subject) return;

  const settings = await payload.findGlobal({ slug: "site-settings", locale: lang, depth: 0 });
  const ref = lead.reference ?? String(lead.id);
  const url = trackingUrl(lead);
  const html = layout(
    escapeHtml(copy.title[status]!),
    `<p style="margin:0 0 12px">${escapeHtml(copy.hello(lead.fullName))}</p>
<p style="margin:0 0 12px">${escapeHtml(copy.body[status]!)}</p>
<p style="margin:0 0 16px">${escapeHtml(copy.reference)} : <strong style="font-family:monospace;font-size:16px" dir="ltr">${escapeHtml(ref)}</strong></p>
<p style="margin:0 0 16px">${buttonHtml(url, copy.track)}</p>
<p style="margin:0">${escapeHtml(copy.questions)} : <span dir="ltr">${escapeHtml(settings.phone)}</span> · ${escapeHtml(settings.email)}</p>`,
    `${escapeHtml(settings.legalName)} — ${escapeHtml(settings.address)}<br>${escapeHtml(copy.auto)}`,
    lang,
  );
  const text = `${copy.hello(lead.fullName)}

${copy.body[status]}

${copy.reference} : ${ref}
${copy.track} : ${url}

${copy.questions} : ${settings.phone} · ${settings.email}`;

  await payload.sendEmail({ to: lead.email, subject: subject(ref), html, text });
  payload.logger.info(`Devis ${ref}: status email (${status}) sent to client.`);
}
