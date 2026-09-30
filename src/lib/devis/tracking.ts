/**
 * Client-facing view of a lead's progress (/{locale}/suivi). Dependency-free so
 * it runs in the tracking form, the server action and unit tests alike.
 *
 * Internal statuses are never shown verbatim: "perdu" is presented as a closed
 * file, "gagne" as a confirmed project.
 */
import { toAsciiDigits } from "./phone";

export const devisStatuses = ["nouveau", "contacte", "devis-envoye", "gagne", "perdu"] as const;
export type DevisStatus = (typeof devisStatuses)[number];

export const trackingSteps = ["received", "review", "quote", "done"] as const;
export type TrackingStep = (typeof trackingSteps)[number];

const stepOfStatus: Record<DevisStatus, TrackingStep> = {
  nouveau: "received",
  contacte: "review",
  "devis-envoye": "quote",
  gagne: "done",
  perdu: "done",
};

/** Statuses that email the client (when an email was given). */
export const clientNotifiedStatuses: readonly DevisStatus[] = ["devis-envoye", "gagne"];

export interface TrackingInput {
  reference?: string | null;
  /** Legacy activity key (typed form), when the request has one. */
  activity?: string | null;
  /** The service's title in every language (form snapshot), for newer requests. */
  service?: Partial<Record<"fr" | "ar" | "en", string | null>> | string | null;
  status: string;
  createdAt: string;
  statusHistory?: { status?: string | null; changedAt?: string | null }[] | null;
}

export interface TrackingView {
  reference: string;
  activity: string;
  service: Partial<Record<"fr" | "ar" | "en", string | null>> | string | null;
  current: TrackingStep;
  /** Only set once the file is done: confirmed project or closed file. */
  outcome: "confirmed" | "closed" | null;
  /** ISO date each step was first reached (null: not reached, or date unknown). */
  steps: { step: TrackingStep; reached: boolean; at: string | null }[];
}

const isStatus = (s: unknown): s is DevisStatus => devisStatuses.includes(s as DevisStatus);

export function buildTrackingView(lead: TrackingInput): TrackingView {
  const status: DevisStatus = isStatus(lead.status) ? lead.status : "nouveau";
  const current = stepOfStatus[status];
  const currentIndex = trackingSteps.indexOf(current);

  // Earliest date per step; "received" is always the creation date.
  const firstAt = new Map<TrackingStep, string>([["received", lead.createdAt]]);
  for (const entry of lead.statusHistory ?? []) {
    if (!isStatus(entry.status) || !entry.changedAt) continue;
    const step = stepOfStatus[entry.status];
    const known = firstAt.get(step);
    if (!known || entry.changedAt < known) firstAt.set(step, entry.changedAt);
  }

  return {
    reference: lead.reference ?? "",
    activity: lead.activity ?? "",
    service: lead.service ?? null,
    current,
    outcome: status === "gagne" ? "confirmed" : status === "perdu" ? "closed" : null,
    // Steps after the current one are pending even if the history has them
    // (the team moved a status back); skipped steps count as passed, undated.
    steps: trackingSteps.map((step, i) => {
      const reached = i <= currentIndex;
      return { step, reached, at: reached ? (firstAt.get(step) ?? null) : null };
    }),
  };
}

/** Site initials (GT, HE…), date, 4 hex digits. */
const REFERENCE = /^[A-Z]{2,3}-\d{6}-[0-9A-F]{4}$/;

/** " gt-260928-e88a " / "GT 260928 E88A" / Arabic-Indic digits → "GT-260928-E88A" (null if malformed). */
export function normalizeReference(value: string): string | null {
  const compact = toAsciiDigits(value)
    .toUpperCase()
    .replace(/[\s_–—-]+/g, "");
  const match = /^([A-Z]{2,3})(\d{6})([0-9A-F]{4})$/.exec(compact);
  const ref = match ? `${match[1]}-${match[2]}-${match[3]}` : null;
  return ref && REFERENCE.test(ref) ? ref : null;
}
