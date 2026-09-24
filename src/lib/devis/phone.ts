/**
 * Tunisian phone numbers: 8 digits starting with 2–9 (mobile 2/4/5/9, landline
 * 7…), optionally prefixed with +216 / 00216 / 216. Stored canonically as
 * "+216XXXXXXXX" so WhatsApp links and exports are consistent.
 */

const CANONICAL = /^\+216[2-9]\d{7}$/;

/** Arabic-Indic (٠-٩) and Eastern Arabic-Indic (۰-۹) digits → ASCII. */
export function toAsciiDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/** "98 123 456", "+216 98-123-456", "٩٨١٢٣٤٥٦" → "+21698123456" (unchanged if not Tunisian). */
export function normalizeTnPhone(value: string): string {
  const compact = toAsciiDigits(value).replace(/[\s.\-()]/g, "");
  const local = compact.replace(/^(?:\+216|00216|216(?=\d{8}$))/, "");
  return /^\d{8}$/.test(local) ? `+216${local}` : compact;
}

export function isValidTnPhone(value: string): boolean {
  return CANONICAL.test(normalizeTnPhone(value));
}
