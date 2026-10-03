import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { ar } from "@payloadcms/translations/languages/ar";
import { en } from "@payloadcms/translations/languages/en";
import { fr } from "@payloadcms/translations/languages/fr";
import sharp from "sharp";

import { CompanyDocuments } from "./collections/CompanyDocuments";
import { DevisAttachments } from "./collections/DevisAttachments";
import { DevisForms } from "./collections/DevisForms";
import { DevisRequests } from "./collections/DevisRequests";
import { Faq } from "./collections/Faq";
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
import { Partners } from "./collections/Partners";
import { Projects } from "./collections/Projects";
import { QuoteDocuments } from "./collections/QuoteDocuments";
import { Redirects } from "./collections/Redirects";
import { Services } from "./collections/Services";
import { Sites } from "./collections/Sites";
import { Team } from "./collections/Team";
import { Users } from "./collections/Users";
import { documentExpiryTask } from "./jobs/document-expiry";
import { Group } from "./globals/Group";
import { defaultLocale, localeNames, locales, rtlLocales } from "./i18n/config";
import { migrations } from "./migrations";

/**
 * SMTP email (devis notifications, admin password resets). Only enabled when
 * SMTP_HOST is set; otherwise Payload logs emails to the console (dev).
 * A failed SMTP check at startup is logged, never fatal.
 */
function emailAdapter() {
  const host = process.env.SMTP_HOST;
  if (!host) return undefined;
  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailerAdapter({
    defaultFromAddress: process.env.MAIL_FROM || "no-reply@growing-technologies.tn",
    defaultFromName: process.env.MAIL_FROM_NAME || "Growing Technologies",
    transportOptions: {
      host,
      port,
      secure: port === 465, // implicit TLS; 587/25 upgrade with STARTTLS
      ...(process.env.SMTP_USER && {
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      }),
    },
  });
}

/**
 * Public origin of the site/admin. Payload only accepts the admin session
 * cookie on requests from this origin (CSRF protection), so it must match the
 * URL the admin is opened from — otherwise every save fails with 403.
 * SERVER_URL is read at runtime; NEXT_PUBLIC_SITE_URL is inlined at build time.
 *
 * Development: only an explicit SERVER_URL counts. Without one the admin's
 * requests stay relative and its session is accepted on any address, so it
 * also works from another device (http://192.168.1.20:3000/admin).
 */
const serverURL =
  process.env.SERVER_URL || (process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_SITE_URL : undefined);

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // Absolute upload URLs + the origin allowed to use the admin session cookie.
  ...(serverURL && { serverURL }),
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: " — Administration",
    },
    dateFormat: "dd/MM/yyyy",
    // Built-in avatar instead of Gravatar: no admin email hash sent to a third party.
    avatar: "default",
    components: {
      // Company documents that are expired or about to expire.
      beforeDashboard: ["/components/admin/document-expiry#DocumentExpiry"],
    },
  },
  collections: [
    Pages,
    Services,
    Projects,
    Partners,
    Faq,
    Team,
    DevisRequests,
    DevisForms,
    QuoteDocuments,
    DevisAttachments,
    CompanyDocuments,
    Media,
    Sites,
    Redirects,
    Users,
  ],
  globals: [Group],
  // Background tasks. The scheduler queues each task at its `schedule` time and
  // this autoRun (checked every 10 minutes, in the Next.js server process) runs it.
  jobs: {
    tasks: [documentExpiryTask],
    autoRun: [{ cron: "0 */10 * * * *", queue: "daily" }],
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || "",
    },
    migrationDir: path.resolve(dirname, "migrations"),
    // Dev: schema is auto-pushed. Production: never pushed — pending migrations
    // run on startup instead (`npm run migrate:create` after schema changes).
    prodMigrations: migrations,
  }),
  sharp,
  email: emailAdapter(),
  // Content localization (devplan §4, §5). Every `localized: true` field stores
  // one value per locale. A missing ar/en value falls back to French (the base
  // language), never to English.
  localization: {
    locales: locales.map((code) => ({
      code,
      label: localeNames[code],
      rtl: rtlLocales.includes(code),
    })),
    defaultLocale,
    fallback: true,
  },
  // Admin UI language (independent from content locale).
  i18n: {
    supportedLanguages: { fr, ar, en },
    fallbackLanguage: "fr",
  },
});
