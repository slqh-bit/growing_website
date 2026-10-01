import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_sites_key" AS ENUM('growing', 'hikview', 'group');
  CREATE TABLE "sites_domains" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"domain" varchar NOT NULL
  );
  
  CREATE TABLE "sites_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "sites_stats_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" "enum_sites_key" NOT NULL,
  	"is_default" boolean DEFAULT false,
  	"url" varchar,
  	"company_name" varchar NOT NULL,
  	"legal_name" varchar NOT NULL,
  	"matricule_fiscal" varchar NOT NULL,
  	"certification" varchar,
  	"logo_id" integer,
  	"logo_dark_id" integer,
  	"logo_includes_name" boolean DEFAULT false,
  	"monogram" varchar,
  	"favicon_id" integer,
  	"theme_primary" varchar,
  	"theme_accent" varchar,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"whatsapp" varchar,
  	"telegram" varchar,
  	"coords_lat" numeric NOT NULL,
  	"coords_lng" numeric NOT NULL,
  	"socials_facebook" varchar,
  	"socials_instagram" varchar,
  	"socials_linkedin" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sites_locales" (
  	"tagline" varchar NOT NULL,
  	"address" varchar NOT NULL,
  	"city" varchar NOT NULL,
  	"hours" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "users_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sites_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sites_id" integer;
  ALTER TABLE "sites_domains" ADD CONSTRAINT "sites_domains_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_stats" ADD CONSTRAINT "sites_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_stats_locales" ADD CONSTRAINT "sites_stats_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites_stats"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites" ADD CONSTRAINT "sites_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sites" ADD CONSTRAINT "sites_logo_dark_id_media_id_fk" FOREIGN KEY ("logo_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sites" ADD CONSTRAINT "sites_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sites_locales" ADD CONSTRAINT "sites_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_rels" ADD CONSTRAINT "users_rels_sites_fk" FOREIGN KEY ("sites_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "sites_domains_order_idx" ON "sites_domains" USING btree ("_order");
  CREATE INDEX "sites_domains_parent_id_idx" ON "sites_domains" USING btree ("_parent_id");
  CREATE INDEX "sites_stats_order_idx" ON "sites_stats" USING btree ("_order");
  CREATE INDEX "sites_stats_parent_id_idx" ON "sites_stats" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sites_stats_locales_locale_parent_id_unique" ON "sites_stats_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "sites_key_idx" ON "sites" USING btree ("key");
  CREATE INDEX "sites_logo_idx" ON "sites" USING btree ("logo_id");
  CREATE INDEX "sites_logo_dark_idx" ON "sites" USING btree ("logo_dark_id");
  CREATE INDEX "sites_favicon_idx" ON "sites" USING btree ("favicon_id");
  CREATE INDEX "sites_updated_at_idx" ON "sites" USING btree ("updated_at");
  CREATE INDEX "sites_created_at_idx" ON "sites" USING btree ("created_at");
  CREATE UNIQUE INDEX "sites_locales_locale_parent_id_unique" ON "sites_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "users_rels_order_idx" ON "users_rels" USING btree ("order");
  CREATE INDEX "users_rels_parent_idx" ON "users_rels" USING btree ("parent_id");
  CREATE INDEX "users_rels_path_idx" ON "users_rels" USING btree ("path");
  CREATE INDEX "users_rels_sites_id_idx" ON "users_rels" USING btree ("sites_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sites_fk" FOREIGN KEY ("sites_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_sites_id_idx" ON "payload_locked_documents_rels" USING btree ("sites_id");`)

  // Data: the former "Site settings" global becomes the Growing site (default
  // site, default palette). Its tagline was the `common.companyTagline` UI
  // message until now. A fresh database has no settings: the seed creates the
  // sites instead. site_settings is dropped by the next migration.
  await db.execute(sql`
  INSERT INTO "sites" ("key", "is_default", "company_name", "legal_name", "matricule_fiscal", "certification",
    "monogram", "email", "phone", "whatsapp", "telegram", "coords_lat", "coords_lng",
    "socials_facebook", "socials_instagram", "socials_linkedin")
  SELECT 'growing', true, "company_name", "legal_name", "matricule_fiscal", "certification",
    'GT', "email", "phone", "whatsapp", "telegram", "coords_lat", "coords_lng",
    "socials_facebook", "socials_instagram", "socials_linkedin"
  FROM "site_settings" ORDER BY "id" LIMIT 1;

  INSERT INTO "sites_locales" ("tagline", "address", "city", "hours", "_locale", "_parent_id")
  SELECT
    CASE l."_locale"
      WHEN 'ar' THEN 'طاقة شمسية وكهرباء — مركّب معتمد من الوكالة الوطنية للتحكم في الطاقة'
      WHEN 'en' THEN 'Solar energy & electrical works — ANME-certified installer'
      ELSE 'Énergie solaire & électricité — installateur certifié ANME'
    END,
    l."address", l."city", l."hours", l."_locale", s."id"
  FROM "site_settings_locales" l
  JOIN "sites" s ON s."key" = 'growing'
  WHERE l."_parent_id" = (SELECT min("id") FROM "site_settings");

  INSERT INTO "sites_stats" ("_order", "_parent_id", "id", "value")
  SELECT st."_order", s."id", st."id", st."value"
  FROM "site_settings_stats" st
  JOIN "sites" s ON s."key" = 'growing'
  WHERE st."_parent_id" = (SELECT min("id") FROM "site_settings");

  INSERT INTO "sites_stats_locales" ("label", "_locale", "_parent_id")
  SELECT sl."label", sl."_locale", sl."_parent_id"
  FROM "site_settings_stats_locales" sl
  WHERE sl."_parent_id" IN (SELECT "id" FROM "sites_stats");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sites_domains" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sites_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sites_stats_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sites" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sites_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "sites_domains" CASCADE;
  DROP TABLE "sites_stats" CASCADE;
  DROP TABLE "sites_stats_locales" CASCADE;
  DROP TABLE "sites" CASCADE;
  DROP TABLE "sites_locales" CASCADE;
  DROP TABLE "users_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sites_fk";
  
  DROP INDEX "payload_locked_documents_rels_sites_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sites_id";
  DROP TYPE "public"."enum_sites_key";`)
}
