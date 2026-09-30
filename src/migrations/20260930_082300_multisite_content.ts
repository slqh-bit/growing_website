import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'
import { createLocalized, updateLocalized } from '../cms/localized-write'
import { serviceData } from '../../scripts/seed-data/build'
import { redirects } from '../../scripts/seed-data/redirects'
import { services } from '../../scripts/seed-data/services'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_partners_kinds" AS ENUM('manufacturer', 'distributor', 'own-product', 'certification');
  CREATE TYPE "public"."enum_services_sections_icon" AS ENUM('PlugZap', 'Droplets', 'BatteryCharging', 'Cable', 'Zap', 'Sun', 'House', 'Building2', 'Factory', 'Tractor', 'Lightbulb', 'RadioTower', 'Cctv', 'Siren', 'Fingerprint', 'Flame', 'Network', 'Router', 'Wifi', 'Server', 'Phone', 'ScanBarcode', 'Store', 'Monitor', 'Presentation', 'Tv', 'ListOrdered', 'Video', 'Cpu', 'Landmark');
  CREATE TYPE "public"."enum_partners_kind" AS ENUM('manufacturer', 'distributor', 'own-product', 'certification');
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'House' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Building2' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Factory' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Tractor' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Lightbulb' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'RadioTower' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Cctv' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Siren' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Fingerprint' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Flame' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Network' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Router' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Wifi' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Server' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Phone' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'ScanBarcode' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Store' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Monitor' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Presentation' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Tv' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'ListOrdered' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Video' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Cpu' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Landmark' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'House';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Building2';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Factory';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Tractor';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Lightbulb';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'RadioTower';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Cctv';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Siren';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Fingerprint';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Flame';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Network';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Router';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Wifi';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Server';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Phone';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'ScanBarcode';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Store';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Monitor';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Presentation';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Tv';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'ListOrdered';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Video';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Cpu';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE 'Landmark';
  CREATE TABLE "pages_blocks_partners_kinds" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_partners_kinds",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_partners_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "services_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor" varchar NOT NULL,
  	"icon" "enum_services_sections_icon",
  	"image_id" integer
  );
  
  CREATE TABLE "services_sections_locales" (
  	"title" varchar NOT NULL,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"kind" "enum_partners_kind" DEFAULT 'manufacturer' NOT NULL,
  	"logo_id" integer NOT NULL,
  	"url" varchar,
  	"show_in_strip" boolean DEFAULT true,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "partners_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "partners_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sites_id" integer,
  	"services_id" integer
  );
  
  CREATE TABLE "sites_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL,
  	"coming_soon" boolean DEFAULT false
  );
  
  CREATE TABLE "sites_nav_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sites_footer_quick_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "sites_footer_quick_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "sites_footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "sites_footer_legal_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"permanent" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sites_id" integer
  );
  
  DROP INDEX "services_activity_key_idx";
  DROP INDEX "pages_slug_idx";
  DROP INDEX "services_slug_idx";
  DROP INDEX "projects_slug_idx";
  ALTER TABLE "services" ALTER COLUMN "activity_key" DROP NOT NULL;
  ALTER TABLE "pages" ADD COLUMN "site_id" integer;
  ALTER TABLE "services" ADD COLUMN "site_id" integer;
  ALTER TABLE "projects" ADD COLUMN "site_id" integer;
  ALTER TABLE "faq" ADD COLUMN "site_id" integer;
  ALTER TABLE "team" ADD COLUMN "site_id" integer;
  ALTER TABLE "sites_locales" ADD COLUMN "footer_tagline" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "partners_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "redirects_id" integer;
  ALTER TABLE "pages_blocks_partners_kinds" ADD CONSTRAINT "pages_blocks_partners_kinds_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_partners" ADD CONSTRAINT "pages_blocks_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_partners_locales" ADD CONSTRAINT "pages_blocks_partners_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_sections" ADD CONSTRAINT "services_sections_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_sections" ADD CONSTRAINT "services_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_sections_locales" ADD CONSTRAINT "services_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_locales" ADD CONSTRAINT "partners_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_sites_fk" FOREIGN KEY ("sites_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_nav_items" ADD CONSTRAINT "sites_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_nav_items_locales" ADD CONSTRAINT "sites_nav_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_footer_quick_links" ADD CONSTRAINT "sites_footer_quick_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_footer_quick_links_locales" ADD CONSTRAINT "sites_footer_quick_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites_footer_quick_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_footer_legal_links" ADD CONSTRAINT "sites_footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_footer_legal_links_locales" ADD CONSTRAINT "sites_footer_legal_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites_footer_legal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_sites_fk" FOREIGN KEY ("sites_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_partners_kinds_order_idx" ON "pages_blocks_partners_kinds" USING btree ("order");
  CREATE INDEX "pages_blocks_partners_kinds_parent_idx" ON "pages_blocks_partners_kinds" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_partners_order_idx" ON "pages_blocks_partners" USING btree ("_order");
  CREATE INDEX "pages_blocks_partners_parent_id_idx" ON "pages_blocks_partners" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_partners_path_idx" ON "pages_blocks_partners" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_partners_locales_locale_parent_id_unique" ON "pages_blocks_partners_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_sections_order_idx" ON "services_sections" USING btree ("_order");
  CREATE INDEX "services_sections_parent_id_idx" ON "services_sections" USING btree ("_parent_id");
  CREATE INDEX "services_sections_image_idx" ON "services_sections" USING btree ("image_id");
  CREATE UNIQUE INDEX "services_sections_locales_locale_parent_id_unique" ON "services_sections_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "partners_logo_idx" ON "partners" USING btree ("logo_id");
  CREATE INDEX "partners_updated_at_idx" ON "partners" USING btree ("updated_at");
  CREATE INDEX "partners_created_at_idx" ON "partners" USING btree ("created_at");
  CREATE UNIQUE INDEX "partners_locales_locale_parent_id_unique" ON "partners_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "partners_rels_order_idx" ON "partners_rels" USING btree ("order");
  CREATE INDEX "partners_rels_parent_idx" ON "partners_rels" USING btree ("parent_id");
  CREATE INDEX "partners_rels_path_idx" ON "partners_rels" USING btree ("path");
  CREATE INDEX "partners_rels_sites_id_idx" ON "partners_rels" USING btree ("sites_id");
  CREATE INDEX "partners_rels_services_id_idx" ON "partners_rels" USING btree ("services_id");
  CREATE INDEX "sites_nav_items_order_idx" ON "sites_nav_items" USING btree ("_order");
  CREATE INDEX "sites_nav_items_parent_id_idx" ON "sites_nav_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sites_nav_items_locales_locale_parent_id_unique" ON "sites_nav_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sites_footer_quick_links_order_idx" ON "sites_footer_quick_links" USING btree ("_order");
  CREATE INDEX "sites_footer_quick_links_parent_id_idx" ON "sites_footer_quick_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sites_footer_quick_links_locales_locale_parent_id_unique" ON "sites_footer_quick_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "sites_footer_legal_links_order_idx" ON "sites_footer_legal_links" USING btree ("_order");
  CREATE INDEX "sites_footer_legal_links_parent_id_idx" ON "sites_footer_legal_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sites_footer_legal_links_locales_locale_parent_id_unique" ON "sites_footer_legal_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_sites_id_idx" ON "redirects_rels" USING btree ("sites_id");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faq" ADD CONSTRAINT "faq_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_site_idx" ON "pages" USING btree ("site_id");
  CREATE UNIQUE INDEX "site_slug_idx" ON "pages" USING btree ("site_id","slug");
  CREATE INDEX "services_site_idx" ON "services" USING btree ("site_id");
  CREATE UNIQUE INDEX "site_slug_1_idx" ON "services" USING btree ("site_id","slug");
  CREATE UNIQUE INDEX "site_activityKey_idx" ON "services" USING btree ("site_id","activity_key");
  CREATE INDEX "projects_site_idx" ON "projects" USING btree ("site_id");
  CREATE UNIQUE INDEX "site_slug_2_idx" ON "projects" USING btree ("site_id","slug");
  CREATE INDEX "faq_site_idx" ON "faq" USING btree ("site_id");
  CREATE INDEX "team_site_idx" ON "team" USING btree ("site_id");
  CREATE INDEX "payload_locked_documents_rels_partners_id_idx" ON "payload_locked_documents_rels" USING btree ("partners_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");`)

  // --- Data -------------------------------------------------------------------
  // 1. Existing content belonged to the only site so far: Growing. (A fresh
  //    database has no content yet: the seed creates it per site.)
  // 2. The former Navigation / Footer globals become Growing's Menu / Pied de
  //    page (Sites); the next migration drops the old tables.
  await db.execute(sql`
  UPDATE "pages" SET "site_id" = (SELECT "id" FROM "sites" WHERE "key" = 'growing') WHERE "site_id" IS NULL;
  UPDATE "services" SET "site_id" = (SELECT "id" FROM "sites" WHERE "key" = 'growing') WHERE "site_id" IS NULL;
  UPDATE "projects" SET "site_id" = (SELECT "id" FROM "sites" WHERE "key" = 'growing') WHERE "site_id" IS NULL;
  UPDATE "faq" SET "site_id" = (SELECT "id" FROM "sites" WHERE "key" = 'growing') WHERE "site_id" IS NULL;
  UPDATE "team" SET "site_id" = (SELECT "id" FROM "sites" WHERE "key" = 'growing') WHERE "site_id" IS NULL;
  ALTER TABLE "pages" ALTER COLUMN "site_id" SET NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "site_id" SET NOT NULL;
  ALTER TABLE "projects" ALTER COLUMN "site_id" SET NOT NULL;
  ALTER TABLE "faq" ALTER COLUMN "site_id" SET NOT NULL;
  ALTER TABLE "team" ALTER COLUMN "site_id" SET NOT NULL;

  INSERT INTO "sites_nav_items" ("_order", "_parent_id", "id", "href", "coming_soon")
  SELECT n."_order", s."id", n."id", n."href", n."coming_soon"
  FROM "navigation_items" n JOIN "sites" s ON s."key" = 'growing';
  INSERT INTO "sites_nav_items_locales" ("label", "_locale", "_parent_id")
  SELECT l."label", l."_locale", l."_parent_id" FROM "navigation_items_locales" l
  WHERE l."_parent_id" IN (SELECT "id" FROM "sites_nav_items");

  UPDATE "sites_locales" sl SET "footer_tagline" = f."tagline"
  FROM "footer_locales" f, "sites" s
  WHERE s."key" = 'growing' AND sl."_parent_id" = s."id" AND sl."_locale" = f."_locale";

  INSERT INTO "sites_footer_quick_links" ("_order", "_parent_id", "id", "href")
  SELECT q."_order", s."id", q."id", q."href"
  FROM "footer_quick_links" q JOIN "sites" s ON s."key" = 'growing';
  INSERT INTO "sites_footer_quick_links_locales" ("label", "_locale", "_parent_id")
  SELECT l."label", l."_locale", l."_parent_id" FROM "footer_quick_links_locales" l
  WHERE l."_parent_id" IN (SELECT "id" FROM "sites_footer_quick_links");

  INSERT INTO "sites_footer_legal_links" ("_order", "_parent_id", "id", "href")
  SELECT g."_order", s."id", g."id", g."href"
  FROM "footer_legal_links" g JOIN "sites" s ON s."key" = 'growing';
  INSERT INTO "sites_footer_legal_links_locales" ("label", "_locale", "_parent_id")
  SELECT l."label", l."_locale", l."_parent_id" FROM "footer_legal_links_locales" l
  WHERE l."_parent_id" IN (SELECT "id" FROM "sites_footer_legal_links");`)

  // 3. Growing's catalogue: 5 services → 4 activities (plan §4.1).
  await restructureGrowingCatalogue(payload, req)
}

/**
 * Only on a database that still has the former BT / MT services: their
 * projects move to "Installations raccordées", the two services are deleted
 * and redirected (301) to its #commercial / #industriel sections, "Site isolé"
 * becomes "Sites isolés & éclairage public solaire", "Centrales
 * photovoltaïques" is created and the activities are reordered.
 */
async function restructureGrowingCatalogue(payload: Payload, req: PayloadRequest): Promise<void> {
  const site = (
    await payload.find({ collection: 'sites', where: { key: { equals: 'growing' } }, limit: 1, depth: 0, req })
  ).docs[0]
  if (!site) return

  const findService = async (slug: string) =>
    (
      await payload.find({
        collection: 'services',
        where: { and: [{ site: { equals: site.id } }, { slug: { equals: slug } }] },
        limit: 1,
        depth: 0,
        req,
      })
    ).docs[0]

  const legacy = (await Promise.all(['basse-tension', 'moyenne-tension'].map(findService))).filter(
    (s): s is NonNullable<typeof s> => s !== undefined,
  )
  if (legacy.length === 0) return
  payload.logger.info('Restructuring the Growing catalogue (5 services → 4 activities)…')

  const catalogue = Object.fromEntries(services.map((s) => [s.slug, s]))
  const context = { disableRevalidate: true }

  // Updated / new activities first, so projects can move to "raccordée".
  const ids: Record<string, number> = {}
  for (const slug of ['pompage-solaire', 'site-isole', 'installation-raccordee', 'centrale-photovoltaique']) {
    const seed = catalogue[slug]
    if (!seed) continue
    const existing = await findService(slug)
    if (!existing) {
      ids[slug] = Number(await createLocalized(payload, 'services', (l) => serviceData(seed, l, site.id), { req }))
    } else if (slug === 'pompage-solaire') {
      await payload.update({ collection: 'services', id: existing.id, data: { order: seed.order }, depth: 0, context, req })
      ids[slug] = existing.id
    } else {
      await updateLocalized(payload, 'services', existing.id, (l) => serviceData(seed, l, site.id), { req })
      ids[slug] = existing.id
    }
  }

  const raccordee = ids['installation-raccordee']
  for (const old of legacy) {
    if (raccordee !== undefined) {
      await payload.update({
        collection: 'projects',
        where: { activity: { equals: old.id } },
        data: { activity: raccordee },
        depth: 0,
        context,
        req,
      })
    }
    await payload.delete({ collection: 'services', id: old.id, depth: 0, context, req })
  }

  for (const redirect of redirects.filter((r) => r.site === 'growing')) {
    const { totalDocs } = await payload.count({ collection: 'redirects', where: { from: { equals: redirect.from } }, req })
    if (totalDocs > 0) continue
    await payload.create({
      collection: 'redirects',
      data: { from: redirect.from, to: redirect.to, sites: [site.id], permanent: true },
      depth: 0,
      context,
      req,
    })
  }
}


export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_partners_kinds" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_partners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_partners_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_sections_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sites_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sites_nav_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sites_footer_quick_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sites_footer_quick_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sites_footer_legal_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sites_footer_legal_links_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_partners_kinds" CASCADE;
  DROP TABLE "pages_blocks_partners" CASCADE;
  DROP TABLE "pages_blocks_partners_locales" CASCADE;
  DROP TABLE "services_sections" CASCADE;
  DROP TABLE "services_sections_locales" CASCADE;
  DROP TABLE "partners" CASCADE;
  DROP TABLE "partners_locales" CASCADE;
  DROP TABLE "partners_rels" CASCADE;
  DROP TABLE "sites_nav_items" CASCADE;
  DROP TABLE "sites_nav_items_locales" CASCADE;
  DROP TABLE "sites_footer_quick_links" CASCADE;
  DROP TABLE "sites_footer_quick_links_locales" CASCADE;
  DROP TABLE "sites_footer_legal_links" CASCADE;
  DROP TABLE "sites_footer_legal_links_locales" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_site_id_sites_id_fk";
  
  ALTER TABLE "services" DROP CONSTRAINT "services_site_id_sites_id_fk";
  
  ALTER TABLE "projects" DROP CONSTRAINT "projects_site_id_sites_id_fk";
  
  ALTER TABLE "faq" DROP CONSTRAINT "faq_site_id_sites_id_fk";
  
  ALTER TABLE "team" DROP CONSTRAINT "team_site_id_sites_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_partners_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_redirects_fk";
  
  ALTER TABLE "pages_blocks_features_items" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_features_items" ALTER COLUMN "icon" SET DEFAULT 'Sun'::text;
  DROP TYPE "public"."enum_pages_blocks_features_items_icon";
  CREATE TYPE "public"."enum_pages_blocks_features_items_icon" AS ENUM('PlugZap', 'Droplets', 'BatteryCharging', 'Cable', 'Zap', 'Sun', 'ShieldCheck', 'MapPin', 'Wrench', 'Headphones', 'Award', 'Heart', 'Eye');
  ALTER TABLE "pages_blocks_features_items" ALTER COLUMN "icon" SET DEFAULT 'Sun'::"public"."enum_pages_blocks_features_items_icon";
  ALTER TABLE "pages_blocks_features_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_pages_blocks_features_items_icon" USING "icon"::"public"."enum_pages_blocks_features_items_icon";
  ALTER TABLE "services" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "services" ALTER COLUMN "icon" SET DEFAULT 'Sun'::text;
  DROP TYPE "public"."enum_services_icon";
  CREATE TYPE "public"."enum_services_icon" AS ENUM('PlugZap', 'Droplets', 'BatteryCharging', 'Cable', 'Zap', 'Sun');
  ALTER TABLE "services" ALTER COLUMN "icon" SET DEFAULT 'Sun'::"public"."enum_services_icon";
  ALTER TABLE "services" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_services_icon" USING "icon"::"public"."enum_services_icon";
  DROP INDEX "pages_site_idx";
  DROP INDEX "site_slug_idx";
  DROP INDEX "services_site_idx";
  DROP INDEX "site_slug_1_idx";
  DROP INDEX "site_activityKey_idx";
  DROP INDEX "projects_site_idx";
  DROP INDEX "site_slug_2_idx";
  DROP INDEX "faq_site_idx";
  DROP INDEX "team_site_idx";
  DROP INDEX "payload_locked_documents_rels_partners_id_idx";
  DROP INDEX "payload_locked_documents_rels_redirects_id_idx";
  DROP INDEX "pages_slug_idx";
  DROP INDEX "services_slug_idx";
  DROP INDEX "projects_slug_idx";
  ALTER TABLE "services" ALTER COLUMN "activity_key" SET NOT NULL;
  CREATE UNIQUE INDEX "services_activity_key_idx" ON "services" USING btree ("activity_key");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  ALTER TABLE "pages" DROP COLUMN "site_id";
  ALTER TABLE "services" DROP COLUMN "site_id";
  ALTER TABLE "projects" DROP COLUMN "site_id";
  ALTER TABLE "faq" DROP COLUMN "site_id";
  ALTER TABLE "team" DROP COLUMN "site_id";
  ALTER TABLE "sites_locales" DROP COLUMN "footer_tagline";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "partners_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "redirects_id";
  DROP TYPE "public"."enum_pages_blocks_partners_kinds";
  DROP TYPE "public"."enum_services_sections_icon";
  DROP TYPE "public"."enum_partners_kind";`)
}
