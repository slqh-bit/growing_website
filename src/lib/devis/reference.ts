import { randomBytes } from "crypto";

/** "GT", "HE"… from a site's initials (Sites → Marque), 2–3 letters; "GT" by default. */
export function referencePrefix(monogram: string | null | undefined): string {
  const letters = (monogram ?? "").toUpperCase().replace(/[^A-Z]/g, "");
  return letters.length >= 2 ? letters.slice(0, 3) : "GT";
}

/** Human-friendly lead reference, e.g. GT-260924-7K2Q. */
export function generateReference(prefix = "GT", date = new Date()): string {
  const ymd = date.toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = randomBytes(3).toString("hex").slice(0, 4).toUpperCase();
  return `${prefix}-${ymd}-${suffix}`;
}
