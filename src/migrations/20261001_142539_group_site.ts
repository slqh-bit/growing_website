import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_stats_style" AS ENUM('band', 'card');
  CREATE TABLE "pages_blocks_group_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"primary_cta_href" varchar,
  	"secondary_cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_group_hero_locales" (
  	"badge" varchar,
  	"title" varchar NOT NULL,
  	"highlight" varchar,
  	"subtitle" varchar,
  	"primary_cta_label" varchar,
  	"secondary_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_companies" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_companies_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"link_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_group_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_group_services_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_steps_items_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_steps_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_group_projects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 6,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_group_projects_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_quote_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_quote_form_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "sites" ALTER COLUMN "matricule_fiscal" DROP NOT NULL;
  ALTER TABLE "pages_blocks_stats" ADD COLUMN "style" "enum_pages_blocks_stats_style" DEFAULT 'band';
  ALTER TABLE "sites_locales" ADD COLUMN "logo_subline" varchar;
  ALTER TABLE "pages_blocks_group_hero" ADD CONSTRAINT "pages_blocks_group_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_group_hero_locales" ADD CONSTRAINT "pages_blocks_group_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_group_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_companies" ADD CONSTRAINT "pages_blocks_companies_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_companies_locales" ADD CONSTRAINT "pages_blocks_companies_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_companies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_group_services" ADD CONSTRAINT "pages_blocks_group_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_group_services_locales" ADD CONSTRAINT "pages_blocks_group_services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_group_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_items" ADD CONSTRAINT "pages_blocks_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_items_locales" ADD CONSTRAINT "pages_blocks_steps_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps" ADD CONSTRAINT "pages_blocks_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_steps_locales" ADD CONSTRAINT "pages_blocks_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_group_projects" ADD CONSTRAINT "pages_blocks_group_projects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_group_projects_locales" ADD CONSTRAINT "pages_blocks_group_projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_group_projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quote_form" ADD CONSTRAINT "pages_blocks_quote_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quote_form_locales" ADD CONSTRAINT "pages_blocks_quote_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_quote_form"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_group_hero_order_idx" ON "pages_blocks_group_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_group_hero_parent_id_idx" ON "pages_blocks_group_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_group_hero_path_idx" ON "pages_blocks_group_hero" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_group_hero_locales_locale_parent_id_unique" ON "pages_blocks_group_hero_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_companies_order_idx" ON "pages_blocks_companies" USING btree ("_order");
  CREATE INDEX "pages_blocks_companies_parent_id_idx" ON "pages_blocks_companies" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_companies_path_idx" ON "pages_blocks_companies" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_companies_locales_locale_parent_id_unique" ON "pages_blocks_companies_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_group_services_order_idx" ON "pages_blocks_group_services" USING btree ("_order");
  CREATE INDEX "pages_blocks_group_services_parent_id_idx" ON "pages_blocks_group_services" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_group_services_path_idx" ON "pages_blocks_group_services" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_group_services_locales_locale_parent_id_unique" ON "pages_blocks_group_services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_steps_items_order_idx" ON "pages_blocks_steps_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_items_parent_id_idx" ON "pages_blocks_steps_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_steps_items_locales_locale_parent_id_unique" ON "pages_blocks_steps_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_steps_order_idx" ON "pages_blocks_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_steps_parent_id_idx" ON "pages_blocks_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_steps_path_idx" ON "pages_blocks_steps" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_steps_locales_locale_parent_id_unique" ON "pages_blocks_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_group_projects_order_idx" ON "pages_blocks_group_projects" USING btree ("_order");
  CREATE INDEX "pages_blocks_group_projects_parent_id_idx" ON "pages_blocks_group_projects" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_group_projects_path_idx" ON "pages_blocks_group_projects" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_group_projects_locales_locale_parent_id_unique" ON "pages_blocks_group_projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_quote_form_order_idx" ON "pages_blocks_quote_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_quote_form_parent_id_idx" ON "pages_blocks_quote_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quote_form_path_idx" ON "pages_blocks_quote_form" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_quote_form_locales_locale_parent_id_unique" ON "pages_blocks_quote_form_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_group_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_group_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_companies" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_companies_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_group_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_group_services_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_steps_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_steps_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_group_projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_group_projects_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_quote_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_quote_form_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_group_hero" CASCADE;
  DROP TABLE "pages_blocks_group_hero_locales" CASCADE;
  DROP TABLE "pages_blocks_companies" CASCADE;
  DROP TABLE "pages_blocks_companies_locales" CASCADE;
  DROP TABLE "pages_blocks_group_services" CASCADE;
  DROP TABLE "pages_blocks_group_services_locales" CASCADE;
  DROP TABLE "pages_blocks_steps_items" CASCADE;
  DROP TABLE "pages_blocks_steps_items_locales" CASCADE;
  DROP TABLE "pages_blocks_steps" CASCADE;
  DROP TABLE "pages_blocks_steps_locales" CASCADE;
  DROP TABLE "pages_blocks_group_projects" CASCADE;
  DROP TABLE "pages_blocks_group_projects_locales" CASCADE;
  DROP TABLE "pages_blocks_quote_form" CASCADE;
  DROP TABLE "pages_blocks_quote_form_locales" CASCADE;
  ALTER TABLE "sites" ALTER COLUMN "matricule_fiscal" SET NOT NULL;
  ALTER TABLE "pages_blocks_stats" DROP COLUMN "style";
  ALTER TABLE "sites_locales" DROP COLUMN "logo_subline";
  DROP TYPE "public"."enum_pages_blocks_stats_style";`)
}
