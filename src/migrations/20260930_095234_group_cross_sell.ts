import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "group_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"site_id" integer NOT NULL
  );
  
  CREATE TABLE "group_members_locales" (
  	"summary" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "group" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"footer_band" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "group_locales" (
  	"name" varchar DEFAULT 'Groupe Growing & Hikview' NOT NULL,
  	"tagline" varchar,
  	"story" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "services_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "group_members" ADD CONSTRAINT "group_members_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "group_members" ADD CONSTRAINT "group_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "group_members_locales" ADD CONSTRAINT "group_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."group_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "group_locales" ADD CONSTRAINT "group_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."group"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "group_members_order_idx" ON "group_members" USING btree ("_order");
  CREATE INDEX "group_members_parent_id_idx" ON "group_members" USING btree ("_parent_id");
  CREATE INDEX "group_members_site_idx" ON "group_members" USING btree ("site_id");
  CREATE UNIQUE INDEX "group_members_locales_locale_parent_id_unique" ON "group_members_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "group_locales_locale_parent_id_unique" ON "group_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_rels_services_id_idx" ON "services_rels" USING btree ("services_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "group_members" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "group_members_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "group" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "group_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "group_members" CASCADE;
  DROP TABLE "group_members_locales" CASCADE;
  DROP TABLE "group" CASCADE;
  DROP TABLE "group_locales" CASCADE;
  ALTER TABLE "services_rels" DROP CONSTRAINT "services_rels_services_fk";
  
  DROP INDEX "services_rels_services_id_idx";
  ALTER TABLE "services_rels" DROP COLUMN "services_id";`)
}
