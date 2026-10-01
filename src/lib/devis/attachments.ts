/**
 * Files a client attaches to a quote request (plans, photos, specifications,
 * tender documents). Shared by the form (instant feedback) and the server
 * action (authoritative); Payload then checks each file's real content type
 * against `attachmentMimeTypes` (DevisAttachments).
 */

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
/** Keeps the request under the server-action body limit (next.config.ts). */
export const MAX_ATTACHMENTS_TOTAL_BYTES = 20 * 1024 * 1024;

/** Extension → content type. PDF, photos, Word/Excel, AutoCAD plans. */
const types: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  dwg: "image/vnd.dwg",
};

export const attachmentMimeTypes = [...new Set([...Object.values(types), "image/heif"])];

/** For `<input accept>`. */
export const attachmentAccept = Object.keys(types)
  .map((ext) => `.${ext}`)
  .join(",");

export type AttachmentErrorKey = "fileType" | "fileTooLarge" | "tooManyFiles";

const extensionOf = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

/** The first problem with a set of files, if any (count, size, extension). */
export function checkAttachments(files: readonly { name: string; size: number }[]): AttachmentErrorKey | null {
  if (files.length > MAX_ATTACHMENTS) return "tooManyFiles";
  if (files.some((f) => !(extensionOf(f.name) in types))) return "fileType";
  if (files.some((f) => f.size === 0 || f.size > MAX_ATTACHMENT_BYTES)) return "fileTooLarge";
  if (files.reduce((sum, f) => sum + f.size, 0) > MAX_ATTACHMENTS_TOTAL_BYTES) return "fileTooLarge";
  return null;
}

const startsWith = (bytes: Uint8Array, signature: string, offset = 0) =>
  [...signature].every((c, i) => bytes[offset + i] === c.charCodeAt(0));

/** Signature (first bytes) expected for each kind of file. */
const signatures: Record<string, (b: Uint8Array) => boolean> = {
  pdf: (b) => startsWith(b, "%PDF-"),
  jpg: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  png: (b) => startsWith(b, "\x89PNG\r\n\x1a\n"),
  webp: (b) => startsWith(b, "RIFF") && startsWith(b, "WEBP", 8),
  heic: (b) => startsWith(b, "ftyp", 4),
  docx: (b) => startsWith(b, "PK\x03\x04"), // Office files are zip archives
  dwg: (b) => startsWith(b, "AC10"),
};
signatures.jpeg = signatures.jpg!;
signatures.xlsx = signatures.docx!;

/**
 * Whether a file's first bytes match its extension: a script or web page
 * renamed "plan.jpg" is refused. (Payload checks the type again, but falls
 * back to the extension for content it can't recognise.)
 */
export function matchesSignature(name: string, firstBytes: Uint8Array): boolean {
  return signatures[extensionOf(name)]?.(firstBytes) ?? false;
}

/** The content type announced for a file, from its extension (browsers often send none for DWG/HEIC). */
export function attachmentMimeType(name: string): string {
  return types[extensionOf(name)] ?? "application/octet-stream";
}

const units = { fr: ["Ko", "Mo"], en: ["KB", "MB"], ar: ["ك.ب", "م.ب"] } as const;

export function formatBytes(bytes: number, locale: "fr" | "en" | "ar"): string {
  const [kb, mb] = units[locale];
  const fmt = new Intl.NumberFormat(locale === "ar" ? "ar-TN" : `${locale}-TN`, { maximumFractionDigits: 1 });
  const megabytes = bytes / 1024 / 1024;
  return megabytes >= 1 ? `${fmt.format(megabytes)} ${mb}` : `${fmt.format(Math.max(1, Math.round(bytes / 1024)))} ${kb}`;
}
