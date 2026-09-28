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

import { DevisRequests } from "./collections/DevisRequests";
import { Faq } from "./collections/Faq";
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
import { Projects } from "./collections/Projects";
import { QuoteDocuments } from "./collections/QuoteDocuments";
import { Services } from "./collections/Services";
import { Team } from "./collections/Team";
import { Users } from "./collections/Users";
import { Footer } from "./globals/Footer";
import { Navigation } from "./globals/Navigation";
import { SiteSettings } from "./globals/SiteSettings";
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
 */
const serverURL = process.env.SERVER_URL || process.env.NEXT_PUBLIC_SITE_URL;

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
      titleSuffix: " — Growing Technologies",
    },
    dateFormat: "dd/MM/yyyy",
    // Built-in avatar instead of Gravatar: no admin email hash sent to a third party.
    avatar: "default",
  },
  collections: [Pages, Services, Projects, Faq, Team, DevisRequests, QuoteDocuments, Media, Users],
  globals: [SiteSettings, Navigation, Footer],
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
