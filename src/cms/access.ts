import type { Access, FieldAccess } from "payload";

/** CMS roles (devplan §4.9). */
export const roles = ["admin", "editor"] as const;
export type Role = (typeof roles)[number];

function hasRole(user: unknown, role: Role): boolean {
  return (user as { role?: Role | null } | null | undefined)?.role === role;
}

/** Public content (services, projects, FAQ…) is readable by anyone. */
export const anyone: Access = () => true;

/** Any logged-in CMS user (admin or editor). */
export const authenticated: Access = ({ req: { user } }) => Boolean(user);

export const admins: Access = ({ req: { user } }) => hasRole(user, "admin");

/** Admins see everyone; editors only their own user record. */
export const adminsOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (hasRole(user, "admin")) return true;
  return { id: { equals: user.id } };
};

export const adminsFieldLevel: FieldAccess = ({ req: { user } }) => hasRole(user, "admin");

// --- Per-site content (plan §2, §5: Users.sites) ------------------------------

type Id = number | string;
const idOf = (value: unknown): Id | null =>
  typeof value === "object" && value !== null ? ((value as { id?: Id }).id ?? null) : (value as Id | null);

/**
 * Sites a user may manage: `null` = every site (admins, and editors whose
 * "Sites gérés" is empty); otherwise the ids of their sites.
 */
export function managedSiteIds(user: unknown): Id[] | null {
  if (!user || hasRole(user, "admin")) return null;
  const ids = ((user as { sites?: unknown[] | null }).sites ?? []).map(idOf).filter((id): id is Id => id !== null);
  return ids.length > 0 ? ids : null;
}

/**
 * Access for documents owned by one site (`site` field) or several (`sites`):
 * the public reads everything published (the site filters its own queries),
 * editors only see and change their sites' documents, admins delete.
 */
export function siteContentAccess(field: "site" | "sites" = "site") {
  const scoped: Access = ({ req: { user } }) => {
    if (!user) return false;
    const ids = managedSiteIds(user);
    return ids ? { [field]: { in: ids } } : true;
  };
  return {
    read: ((args) => (args.req.user ? scoped(args) : true)) as Access,
    create: (({ req: { user }, data }) => {
      if (!user) return false;
      const ids = managedSiteIds(user);
      if (!ids || !data) return true; // no data = "may the Create button show?"
      const chosen = [data[field]].flat().map(idOf).filter((id) => id !== null);
      return chosen.length > 0 && chosen.every((id) => ids.some((allowed) => String(allowed) === String(id)));
    }) as Access,
    update: scoped,
    delete: admins,
  };
}
