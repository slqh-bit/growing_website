import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { randomBytes } from 'crypto'
import type { SQL } from 'drizzle-orm'
import { locales, type Locale } from '../i18n/config'
import { devisForms } from '../../scripts/seed-data/devis-forms'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_devis_forms_questions_type" AS ENUM('text', 'textarea', 'number', 'select', 'radio', 'multiselect', 'checkbox', 'date');
  CREATE TYPE "public"."enum_devis_forms_questions_width" AS ENUM('half', 'full');
  CREATE TABLE "devis_forms_questions_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar
  );
  
  CREATE TABLE "devis_forms_questions_options_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "devis_forms_questions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_devis_forms_questions_type" DEFAULT 'text' NOT NULL,
  	"name" varchar NOT NULL,
  	"required" boolean DEFAULT false,
  	"width" "enum_devis_forms_questions_width" DEFAULT 'half',
  	"required_group" varchar,
  	"min" numeric,
  	"max" numeric,
  	"show_if_field" varchar,
  	"show_if_equals" varchar
  );
  
  CREATE TABLE "devis_forms_questions_locales" (
  	"label" varchar NOT NULL,
  	"help" varchar,
  	"unit" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "devis_forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"site_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sites_notify_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL
  );
  
  ALTER TABLE "devis_requests" ALTER COLUMN "activity" DROP NOT NULL;
  ALTER TABLE "services" ADD COLUMN "devis_form_id" integer;
  ALTER TABLE "devis_requests" ADD COLUMN "site_id" integer;
  ALTER TABLE "devis_requests" ADD COLUMN "service_id" integer;
  ALTER TABLE "devis_requests" ADD COLUMN "technical_details" jsonb;
  ALTER TABLE "devis_requests" ADD COLUMN "form_snapshot" jsonb;
  ALTER TABLE "sites" ADD COLUMN "notify_telegram_chat_id" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "devis_forms_id" integer;
  ALTER TABLE "devis_forms_questions_options" ADD CONSTRAINT "devis_forms_questions_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devis_forms_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devis_forms_questions_options_locales" ADD CONSTRAINT "devis_forms_questions_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devis_forms_questions_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devis_forms_questions" ADD CONSTRAINT "devis_forms_questions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devis_forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devis_forms_questions_locales" ADD CONSTRAINT "devis_forms_questions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devis_forms_questions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devis_forms" ADD CONSTRAINT "devis_forms_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sites_notify_emails" ADD CONSTRAINT "sites_notify_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "devis_forms_questions_options_order_idx" ON "devis_forms_questions_options" USING btree ("_order");
  CREATE INDEX "devis_forms_questions_options_parent_id_idx" ON "devis_forms_questions_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "devis_forms_questions_options_locales_locale_parent_id_uniqu" ON "devis_forms_questions_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "devis_forms_questions_order_idx" ON "devis_forms_questions" USING btree ("_order");
  CREATE INDEX "devis_forms_questions_parent_id_idx" ON "devis_forms_questions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "devis_forms_questions_locales_locale_parent_id_unique" ON "devis_forms_questions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "devis_forms_site_idx" ON "devis_forms" USING btree ("site_id");
  CREATE INDEX "devis_forms_updated_at_idx" ON "devis_forms" USING btree ("updated_at");
  CREATE INDEX "devis_forms_created_at_idx" ON "devis_forms" USING btree ("created_at");
  CREATE INDEX "sites_notify_emails_order_idx" ON "sites_notify_emails" USING btree ("_order");
  CREATE INDEX "sites_notify_emails_parent_id_idx" ON "sites_notify_emails" USING btree ("_parent_id");
  ALTER TABLE "services" ADD CONSTRAINT "services_devis_form_id_devis_forms_id_fk" FOREIGN KEY ("devis_form_id") REFERENCES "public"."devis_forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "devis_requests" ADD CONSTRAINT "devis_requests_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "devis_requests" ADD CONSTRAINT "devis_requests_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_devis_forms_fk" FOREIGN KEY ("devis_forms_id") REFERENCES "public"."devis_forms"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_devis_form_idx" ON "services" USING btree ("devis_form_id");
  CREATE INDEX "devis_requests_site_idx" ON "devis_requests" USING btree ("site_id");
  CREATE INDEX "devis_requests_service_idx" ON "devis_requests" USING btree ("service_id");
  CREATE INDEX "payload_locked_documents_rels_devis_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("devis_forms_id");`)

  // Data (existing databases):
  // 1. Requests made so far all belong to the default site (Growing).
  await db.execute(sql`
  UPDATE "devis_requests" SET "site_id" = (
    SELECT "id" FROM "sites" ORDER BY "is_default" DESC NULLS LAST, "id" LIMIT 1
  ) WHERE "site_id" IS NULL;
  ALTER TABLE "devis_requests" ALTER COLUMN "site_id" SET NOT NULL;`)

  // 2. Growing's quote forms, built from the former typed form, linked to its
  //    services: the public form keeps working right after the migration.
  await createGrowingForms(db, payload)
}

/**
 * Plain SQL against the tables as they are at this migration (the Local API
 * would write columns that later migrations add). Skipped on a fresh database
 * (no Growing site yet: the seed creates the forms) or if forms already exist.
 */
async function createGrowingForms(db: MigrateUpArgs['db'], payload: MigrateUpArgs['payload']): Promise<void> {
  const rows = async (query: SQL) => ((await db.execute(query)) as unknown as { rows: Record<string, unknown>[] }).rows
  const site = (await rows(sql`SELECT "id" FROM "sites" WHERE "key" = 'growing' LIMIT 1`))[0]?.id as number | undefined
  if (site === undefined) return
  const existing = await rows(sql`SELECT 1 FROM "devis_forms" WHERE "site_id" = ${site} LIMIT 1`)
  if (existing.length > 0) return
  payload.logger.info('Creating the Growing quote forms…')

  const rowId = () => randomBytes(12).toString('hex')
  const text = (v: unknown, l: Locale) =>
    v && typeof v === 'object' ? ((v as Record<string, string | undefined>)[l] ?? null) : null

  for (const form of devisForms.filter((f) => f.site === 'growing')) {
    const formId = (
      await rows(sql`INSERT INTO "devis_forms" ("title", "site_id") VALUES (${form.title}, ${site}) RETURNING "id"`)
    )[0]!.id as number

    for (const [i, q] of form.questions.entries()) {
      const qId = rowId()
      await db.execute(sql`INSERT INTO "devis_forms_questions"
        ("_order", "_parent_id", "id", "type", "name", "required", "width", "required_group", "min", "max", "show_if_field", "show_if_equals")
        VALUES (${i + 1}, ${formId}, ${qId}, ${q.type}, ${q.name}, ${Boolean(q.required)}, ${q.width ?? 'half'},
          ${q.requiredGroup ?? null}, ${q.min ?? null}, ${q.max ?? null}, ${q.showIf?.field ?? null}, ${q.showIf?.equals ?? null})`)
      for (const l of locales) {
        await db.execute(sql`INSERT INTO "devis_forms_questions_locales" ("label", "help", "unit", "_locale", "_parent_id")
          VALUES (${text(q.label, l)}, ${text(q.help, l)}, ${text(q.unit, l)}, ${l}, ${qId})`)
      }
      for (const [j, o] of (q.options ?? []).entries()) {
        const oId = rowId()
        await db.execute(sql`INSERT INTO "devis_forms_questions_options" ("_order", "_parent_id", "id", "value")
          VALUES (${j + 1}, ${qId}, ${oId}, ${o.value})`)
        for (const l of locales) {
          await db.execute(sql`INSERT INTO "devis_forms_questions_options_locales" ("label", "_locale", "_parent_id")
            VALUES (${text(o.label, l)}, ${l}, ${oId})`)
        }
      }
    }

    for (const slug of form.services) {
      await db.execute(sql`UPDATE "services" SET "devis_form_id" = ${formId}
        WHERE "site_id" = ${site} AND "slug" = ${slug} AND "devis_form_id" IS NULL`)
    }
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "devis_forms_questions_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "devis_forms_questions_options_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "devis_forms_questions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "devis_forms_questions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "devis_forms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sites_notify_emails" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "devis_forms_questions_options" CASCADE;
  DROP TABLE "devis_forms_questions_options_locales" CASCADE;
  DROP TABLE "devis_forms_questions" CASCADE;
  DROP TABLE "devis_forms_questions_locales" CASCADE;
  DROP TABLE "devis_forms" CASCADE;
  DROP TABLE "sites_notify_emails" CASCADE;
  ALTER TABLE "services" DROP CONSTRAINT "services_devis_form_id_devis_forms_id_fk";
  
  ALTER TABLE "devis_requests" DROP CONSTRAINT "devis_requests_site_id_sites_id_fk";
  
  ALTER TABLE "devis_requests" DROP CONSTRAINT "devis_requests_service_id_services_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_devis_forms_fk";
  
  DROP INDEX "services_devis_form_idx";
  DROP INDEX "devis_requests_site_idx";
  DROP INDEX "devis_requests_service_idx";
  DROP INDEX "payload_locked_documents_rels_devis_forms_id_idx";
  ALTER TABLE "devis_requests" ALTER COLUMN "activity" SET NOT NULL;
  ALTER TABLE "services" DROP COLUMN "devis_form_id";
  ALTER TABLE "devis_requests" DROP COLUMN "site_id";
  ALTER TABLE "devis_requests" DROP COLUMN "service_id";
  ALTER TABLE "devis_requests" DROP COLUMN "technical_details";
  ALTER TABLE "devis_requests" DROP COLUMN "form_snapshot";
  ALTER TABLE "sites" DROP COLUMN "notify_telegram_chat_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "devis_forms_id";
  DROP TYPE "public"."enum_devis_forms_questions_type";
  DROP TYPE "public"."enum_devis_forms_questions_width";`)
}
