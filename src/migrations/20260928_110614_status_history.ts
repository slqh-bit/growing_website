import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_devis_requests_status_history_status" AS ENUM('nouveau', 'contacte', 'devis-envoye', 'gagne', 'perdu');
  CREATE TABLE "devis_requests_status_history" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"status" "enum_devis_requests_status_history_status" NOT NULL,
  	"changed_at" timestamp(3) with time zone NOT NULL
  );
  
  ALTER TABLE "devis_requests_status_history" ADD CONSTRAINT "devis_requests_status_history_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."devis_requests"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "devis_requests_status_history_order_idx" ON "devis_requests_status_history" USING btree ("_order");
  CREATE INDEX "devis_requests_status_history_parent_id_idx" ON "devis_requests_status_history" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "devis_requests_status_history" CASCADE;
  DROP TYPE "public"."enum_devis_requests_status_history_status";`)
}
