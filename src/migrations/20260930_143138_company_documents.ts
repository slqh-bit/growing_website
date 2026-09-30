import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { randomBytes } from 'crypto'
import type { SQL } from 'drizzle-orm'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_company_documents_type" AS ENUM('attestation-fiscale', 'cnss', 'rne', 'certificat', 'bonne-execution', 'fiche-technique', 'autre');
  CREATE TYPE "public"."enum_company_documents_visibility" AS ENUM('public', 'on-request', 'internal');
  CREATE TYPE "public"."enum_company_documents_alert_level" AS ENUM('valid', 'soon', 'urgent', 'expired');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'documentExpiryAlerts');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'documentExpiryAlerts');
  CREATE TABLE "company_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_company_documents_type" NOT NULL,
  	"valid_until" timestamp(3) with time zone,
  	"site_id" integer NOT NULL,
  	"visibility" "enum_company_documents_visibility" DEFAULT 'public' NOT NULL,
  	"alert_level" "enum_company_documents_alert_level",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "company_documents_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"meta" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_jobs_stats" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"stats" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "services" ADD COLUMN "show_documents" boolean DEFAULT false;
  ALTER TABLE "sites" ADD COLUMN "rne" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "company_documents_id" integer;
  ALTER TABLE "company_documents" ADD CONSTRAINT "company_documents_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "company_documents_locales" ADD CONSTRAINT "company_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "company_documents_type_idx" ON "company_documents" USING btree ("type");
  CREATE INDEX "company_documents_valid_until_idx" ON "company_documents" USING btree ("valid_until");
  CREATE INDEX "company_documents_site_idx" ON "company_documents" USING btree ("site_id");
  CREATE INDEX "company_documents_updated_at_idx" ON "company_documents" USING btree ("updated_at");
  CREATE INDEX "company_documents_created_at_idx" ON "company_documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "company_documents_filename_idx" ON "company_documents" USING btree ("filename");
  CREATE UNIQUE INDEX "company_documents_locales_locale_parent_id_unique" ON "company_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_company_documents_fk" FOREIGN KEY ("company_documents_id") REFERENCES "public"."company_documents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_company_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("company_documents_id");`)

  await linkDocumentsPage(db)
}


/**
 * Existing databases (fresh ones get this from the seed): the footer of each
 * site links to /documents, and the B2G and PV plant pages show the documents
 * box. Plain SQL against the tables as they are at this migration.
 */
async function linkDocumentsPage(db: MigrateUpArgs['db']): Promise<void> {
  const rows = async (query: SQL) => ((await db.execute(query)) as unknown as { rows: Record<string, unknown>[] }).rows

  await db.execute(sql`UPDATE "services" SET "show_documents" = true
    WHERE "slug" IN ('integration-b2g', 'centrale-photovoltaique')`)

  const labels = { fr: 'Documents administratifs', en: 'Company documents', ar: 'الوثائق الإدارية' }
  const sites = await rows(sql`SELECT s."id", COALESCE(MAX(q."_order"), 0) AS "last", COUNT(q."id") AS "count",
      BOOL_OR(q."href" = '/documents') AS "linked"
    FROM "sites" s LEFT JOIN "sites_footer_quick_links" q ON q."_parent_id" = s."id"
    GROUP BY s."id"`)
  for (const site of sites) {
    if (site.linked || Number(site.count) >= 10) continue
    const id = randomBytes(12).toString('hex')
    await db.execute(sql`INSERT INTO "sites_footer_quick_links" ("_order", "_parent_id", "id", "href")
      VALUES (${Number(site.last) + 1}, ${site.id}, ${id}, '/documents')`)
    for (const [locale, label] of Object.entries(labels)) {
      await db.execute(sql`INSERT INTO "sites_footer_quick_links_locales" ("label", "_locale", "_parent_id")
        VALUES (${label}, ${locale}, ${id})`)
    }
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "company_documents" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "company_documents_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload_jobs_stats" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "company_documents" CASCADE;
  DROP TABLE "company_documents_locales" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_jobs_stats" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_company_documents_fk";
  
  DROP INDEX "payload_locked_documents_rels_company_documents_id_idx";
  ALTER TABLE "services" DROP COLUMN "show_documents";
  ALTER TABLE "sites" DROP COLUMN "rne";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "company_documents_id";
  DROP TYPE "public"."enum_company_documents_type";
  DROP TYPE "public"."enum_company_documents_visibility";
  DROP TYPE "public"."enum_company_documents_alert_level";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
