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
