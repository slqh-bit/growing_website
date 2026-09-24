/**
 * Link builders for the company's contact numbers (Site settings). They accept
 * a missing value: before the settings global is first saved — a fresh
 * deployment that hasn't been seeded yet — its fields are undefined, and a
 * crash here would take down every page that shows the footer.
 */
const dialable = (value?: string | null) => (value ?? "").replace(/[^\d+]/g, "");

/** `tel:` link, e.g. "+216 00 000 000" → "tel:+21600000000". */
export const telHref = (phone?: string | null) => `tel:${dialable(phone)}`;

/** wa.me link (international number, digits only). */
export const whatsappHref = (number?: string | null) =>
  `https://wa.me/${dialable(number).replace(/^\+/, "")}`;
