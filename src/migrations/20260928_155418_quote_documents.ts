import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "quote_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
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
  
  ALTER TABLE "devis_requests" ADD COLUMN "quote_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "quote_documents_id" integer;
  CREATE INDEX "quote_documents_updated_at_idx" ON "quote_documents" USING btree ("updated_at");
  CREATE INDEX "quote_documents_created_at_idx" ON "quote_documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "quote_documents_filename_idx" ON "quote_documents" USING btree ("filename");
  ALTER TABLE "devis_requests" ADD CONSTRAINT "devis_requests_quote_id_quote_documents_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quote_documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quote_documents_fk" FOREIGN KEY ("quote_documents_id") REFERENCES "public"."quote_documents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "devis_requests_quote_idx" ON "devis_requests" USING btree ("quote_id");
  CREATE INDEX "payload_locked_documents_rels_quote_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("quote_documents_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "quote_documents" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "quote_documents" CASCADE;
  ALTER TABLE "devis_requests" DROP CONSTRAINT "devis_requests_quote_id_quote_documents_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_quote_documents_fk";
  
  DROP INDEX "devis_requests_quote_idx";
  DROP INDEX "payload_locked_documents_rels_quote_documents_id_idx";
  ALTER TABLE "devis_requests" DROP COLUMN "quote_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "quote_documents_id";`)
}
