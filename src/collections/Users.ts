import type { CollectionConfig } from "payload";
import { admins, adminsFieldLevel, adminsOrSelf, roles } from "../cms/access";
import { groups, t3 } from "../cms/labels";

/** CMS users (devplan §4.9). Roles: admin (everything) / editor (content). */
export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: t3("Utilisateur", "User", "مستخدم"),
    plural: t3("Utilisateurs", "Users", "المستخدمون"),
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["name", "email", "role"],
    group: groups.admin,
  },
  auth: {
    tokenExpiration: 60 * 60 * 8, // 8h working session
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000, // 15 min lock after 5 failed logins
    cookies: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
    },
  },
  access: {
    create: admins,
    read: adminsOrSelf,
    update: adminsOrSelf,
    delete: admins,
  },
  hooks: {
    beforeChange: [
      // The very first account (created via /admin or the seed) is always an admin,
      // so a fresh install can never lock itself out of user management.
      async ({ data, operation, req }) => {
        if (operation === "create") {
          const { totalDocs } = await req.payload.count({ collection: "users", req });
          if (totalDocs === 0) return { ...data, role: "admin" };
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: t3("Nom", "Name", "الاسم"),
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      saveToJWT: true,
      label: t3("Rôle", "Role", "الدور"),
      options: [
        { value: roles[0], label: t3("Administrateur", "Administrator", "مسؤول") },
        { value: roles[1], label: t3("Éditeur", "Editor", "محرّر") },
      ],
      // Editors can't promote themselves.
      access: {
        create: adminsFieldLevel,
        update: adminsFieldLevel,
      },
      admin: { position: "sidebar" },
    },
  ],
};
