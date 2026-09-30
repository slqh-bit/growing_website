import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { locales } from '../i18n/config'
import { centraleAttachments } from '../../scripts/seed-data/devis-forms'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_devis_forms_attachments_mode" AS ENUM('optional', 'required', 'off');
  CREATE TABLE "devis_requests_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"devis_attachments_id" integer
  );
  
  CREATE TABLE "devis_forms_locales" (
  	"attachments_label" varchar,
  	"attachments_help" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "devis_attachments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site_id" integer NOT NULL,
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
  
  ALTER TABLE "devis_requests" ADD COLUMN "site_visit" boolean DEFAULT false;
  ALTER TABLE "devis_forms" ADD COLUMN "attachments_mode" "enum_devis_forms_attachments_mode" DEFAULT 'optional' NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "devis_attachments_id" integer;
  ALTER TABLE "devis_requests_rels" ADD CONSTRAINT "devis_requests_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."devis_requests"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devis_requests_rels" ADD CONSTRAINT "devis_requests_rels_devis_attachments_fk" FOREIGN KEY ("devis_attachments_id") REFERENCES "public"."devis_attachments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devis_forms_locales" ADD CONSTRAINT "devis_forms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devis_forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "devis_attachments" ADD CONSTRAINT "devis_attachments_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "devis_requests_rels_order_idx" ON "devis_requests_rels" USING btree ("order");
  CREATE INDEX "devis_requests_rels_parent_idx" ON "devis_requests_rels" USING btree ("parent_id");
  CREATE INDEX "devis_requests_rels_path_idx" ON "devis_requests_rels" USING btree ("path");
  CREATE INDEX "devis_requests_rels_devis_attachments_id_idx" ON "devis_requests_rels" USING btree ("devis_attachments_id");
  CREATE UNIQUE INDEX "devis_forms_locales_locale_parent_id_unique" ON "devis_forms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "devis_attachments_site_idx" ON "devis_attachments" USING btree ("site_id");
  CREATE INDEX "devis_attachments_updated_at_idx" ON "devis_attachments" USING btree ("updated_at");
  CREATE INDEX "devis_attachments_created_at_idx" ON "devis_attachments" USING btree ("created_at");
  CREATE UNIQUE INDEX "devis_attachments_filename_idx" ON "devis_attachments" USING btree ("filename");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_devis_attachments_fk" FOREIGN KEY ("devis_attachments_id") REFERENCES "public"."devis_attachments"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_devis_attachments_id_idx" ON "payload_locked_documents_rels" USING btree ("devis_attachments_id");`)

  // Existing databases: the PV plant form asks for the project's documents (plan §6.2).
  // Fresh databases get it from the seed. Plain SQL, see 20260930_101604_devis_form_builder.
  for (const l of locales) {
    await db.execute(sql`INSERT INTO "devis_forms_locales" ("attachments_label", "attachments_help", "_locale", "_parent_id")
      SELECT ${centraleAttachments.label[l]}, ${centraleAttachments.help[l]}, ${l}, f."id"
      FROM "devis_forms" f JOIN "sites" s ON s."id" = f."site_id"
      WHERE s."key" = 'growing' AND f."title" = 'Centrale photovoltaïque (1 à 10 MW)'
      ON CONFLICT ("_locale", "_parent_id") DO NOTHING`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "devis_requests_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "devis_forms_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "devis_attachments" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "devis_requests_rels" CASCADE;
  DROP TABLE "devis_forms_locales" CASCADE;
  DROP TABLE "devis_attachments" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_devis_attachments_fk";
  
  DROP INDEX "payload_locked_documents_rels_devis_attachments_id_idx";
  ALTER TABLE "devis_requests" DROP COLUMN "site_visit";
  ALTER TABLE "devis_forms" DROP COLUMN "attachments_mode";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "devis_attachments_id";
  DROP TYPE "public"."enum_devis_forms_attachments_mode";`)
}
