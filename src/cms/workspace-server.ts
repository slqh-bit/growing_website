import type { BaseFilter, Payload, PayloadRequest } from "payload";
import { brandHex } from "../lib/theme";
import { siteKeys, type SiteKey } from "../sites/config";
import { managedSiteIds } from "./access";
import { pickWorkspace, readCookie, workspaceWhere, WORKSPACE_COOKIE, type Id } from "./workspace";

/** What the admin shows of a site: its name and brand colour in the sidebar. */
export interface WorkspaceSite {
  id: Id;
  key: SiteKey;
  name: string;
  monogram: string;
  /** Brand colour (hex), or null for the default palette. */
  color: string | null;
}

export interface Workspace {
  /** The site the admin is working on; null when no site exists yet or nobody is logged in. */
  current: WorkspaceSite | null;
  /** The sites this user may switch between. */
  sites: WorkspaceSite[];
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((word) => word[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

/**
 * The workspace of a user: the requested site (the `admin-site` cookie) when
 * they manage it, else their first site.
 */
export async function loadWorkspace(
  payload: Payload,
  user: unknown,
  requested: string | null,
  /** Inside a request: read within its transaction rather than on a second connection. */
  req?: PayloadRequest,
): Promise<Workspace> {
  if (!user) return { current: null, sites: [] };
  const { docs } = await payload.find({ collection: "sites", depth: 0, limit: 50, pagination: false, req });
  const managed = managedSiteIds(user);
  const sites = docs
    .filter((site) => !managed || managed.some((id) => String(id) === String(site.id)))
    .sort((a, b) => siteKeys.indexOf(a.key) - siteKeys.indexOf(b.key))
    .map(
      (site): WorkspaceSite => ({
        id: site.id,
        key: site.key,
        name: site.companyName,
        monogram: site.monogram?.trim() || initials(site.companyName),
        color: site.theme?.primary ? brandHex(site.theme).from : null,
      }),
    );
  const currentId = pickWorkspace(
    requested,
    sites.map((site) => site.id),
  );
  return { current: sites.find((site) => site.id === currentId) ?? null, sites };
}

/** The workspace of an admin request, read once per request. */
export async function resolveWorkspace(req: PayloadRequest): Promise<Workspace> {
  // Calls made outside the admin (the public quote form, the seed) have no user.
  if (!req.user) return { current: null, sites: [] };
  const cached = req.context?.workspace as Workspace | undefined;
  if (cached) return cached;
  const workspace = await loadWorkspace(
    req.payload,
    req.user,
    readCookie(req.headers?.get("cookie"), WORKSPACE_COOKIE),
    req,
  );
  if (req.context) req.context.workspace = workspace;
  return workspace;
}

/** Id of the site new documents are created on. */
export async function workspaceSiteId(req: PayloadRequest): Promise<Id | undefined> {
  return (await resolveWorkspace(req)).current?.id;
}

/** `admin.baseFilter` limiting a collection's list to the workspace. */
export function workspaceFilter(field: "site" | "sites"): BaseFilter {
  return async ({ req }) => workspaceWhere(field, (await resolveWorkspace(req)).current?.id ?? null);
}
