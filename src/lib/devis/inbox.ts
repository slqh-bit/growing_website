import { telHref, whatsappHref } from "../contact-links";
import { normalizeTnPhone } from "./phone";

/**
 * The admin's quote-request inbox: its three tabs, the step that follows each
 * status, and the links used to reach the client.
 */
export const inboxTabs = ["new", "progress", "done"] as const;
export type InboxTab = (typeof inboxTabs)[number];

const statusesByTab: Record<InboxTab, string[]> = {
  new: ["nouveau"],
  progress: ["contacte", "devis-envoye"],
  done: ["gagne", "perdu"],
};

export const tabStatuses = (tab: InboxTab): string[] => statusesByTab[tab];

export function tabOf(status: string | null | undefined): InboxTab {
  return inboxTabs.find((tab) => statusesByTab[tab].includes(status ?? "")) ?? "new";
}

/** `?tab=` from the URL (a repeated parameter keeps its first value). */
export function parseTab(value: string | string[] | undefined): InboxTab {
  const tab = Array.isArray(value) ? value[0] : value;
  return inboxTabs.find((known) => known === tab) ?? "new";
}

/** The steps a request goes through; "perdu" can be reached from any of them. */
export const requestSteps = ["nouveau", "contacte", "devis-envoye", "gagne"] as const;

export function nextStatus(status: string | null | undefined): string | null {
  const index = (requestSteps as readonly string[]).indexOf(status ?? "");
  return index === -1 ? null : (requestSteps[index + 1] ?? null);
}

export interface ContactLinks {
  call?: string;
  whatsapp?: string;
  email?: string;
}

export function contactLinks({ phone, email }: { phone?: string | null; email?: string | null }): ContactLinks {
  const links: ContactLinks = {};
  if (phone?.trim()) {
    const normalized = normalizeTnPhone(phone);
    links.call = telHref(normalized);
    links.whatsapp = whatsappHref(normalized);
  }
  if (email?.trim()) links.email = `mailto:${email.trim()}`;
  return links;
}

/**
 * Why Payload's REST API refused a change: the field's own message when a
 * validation failed (e.g. "attach the quote PDF first"), else the error's.
 */
export function refusalMessage(body: unknown, fallback: string): string {
  const error = (body as { errors?: { message?: string; data?: { errors?: { message?: string }[] } }[] } | null)
    ?.errors?.[0];
  return error?.data?.errors?.[0]?.message || error?.message || fallback;
}
