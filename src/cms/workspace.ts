import type { Where } from "payload";

/**
 * The admin works inside one site at a time (the "workspace"): lists only show
 * that site's documents and new documents are created on it. Dependency-free
 * so it can be unit tested; `workspace-server.ts` resolves it for a request.
 */
export const WORKSPACE_COOKIE = "admin-site";

export type Id = number | string;

/** Value of one cookie in a `Cookie` header, or null. */
export function readCookie(header: string | null | undefined, name: string): string | null {
  for (const part of (header ?? "").split(";")) {
    const index = part.indexOf("=");
    if (index === -1 || part.slice(0, index).trim() !== name) continue;
    const raw = part.slice(index + 1).trim();
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return null;
}

/**
 * The site the admin works on: the requested one when the user manages it,
 * otherwise their first site. A cookie can therefore never select a site the
 * user has no right to.
 */
export function pickWorkspace(requested: string | null, allowed: readonly Id[]): Id | null {
  return allowed.find((id) => String(id) === requested) ?? allowed[0] ?? null;
}

/** List filter for documents owned by one site (`site`) or published on several (`sites`). */
export function workspaceWhere(field: "site" | "sites", id: Id | null): Where | null {
  if (id === null) return null;
  return field === "site" ? { site: { equals: id } } : { sites: { in: [id] } };
}
