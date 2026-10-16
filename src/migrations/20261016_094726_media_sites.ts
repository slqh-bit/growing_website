import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Media → Sites (hasMany): editors only change their own companies' images.
 * Backfill: each image goes to every site that uses it (site brand images,
 * pages, services, projects, team, partner logos — a partner shown on several
 * sites shares its logo with all of them). Images nobody uses yet go to every
 * site, as before, so whoever uploaded one still finds it in their library.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "media_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sites_id" integer
  );

  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_rels" ADD CONSTRAINT "media_rels_sites_fk" FOREIGN KEY ("sites_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_rels_order_idx" ON "media_rels" USING btree ("order");
  CREATE INDEX "media_rels_parent_idx" ON "media_rels" USING btree ("parent_id");
  CREATE INDEX "media_rels_path_idx" ON "media_rels" USING btree ("path");
  CREATE INDEX "media_rels_sites_id_idx" ON "media_rels" USING btree ("sites_id");`)

  await db.execute(sql`
  WITH uses (media_id, site_id) AS (
    SELECT logo_id, id FROM sites
    UNION SELECT logo_dark_id, id FROM sites
    UNION SELECT og_image_id, id FROM sites
    UNION SELECT favicon_id, id FROM sites
    UNION SELECT seo_og_image_id, site_id FROM pages
    UNION SELECT b.image_id, p.site_id FROM pages_blocks_hero b JOIN pages p ON p.id = b._parent_id
    UNION SELECT l.image_id, p.site_id FROM pages_blocks_logos_logos l
      JOIN pages_blocks_logos b ON b.id = l._parent_id JOIN pages p ON p.id = b._parent_id
    UNION SELECT hero_image_id, site_id FROM services
    UNION SELECT seo_og_image_id, site_id FROM services
    UNION SELECT x.image_id, s.site_id FROM services_sections x JOIN services s ON s.id = x._parent_id
    UNION SELECT cover_image_id, site_id FROM projects
    UNION SELECT seo_og_image_id, site_id FROM projects
    UNION SELECT r.media_id, p.site_id FROM projects_rels r JOIN projects p ON p.id = r.parent_id
    UNION SELECT photo_id, site_id FROM team
    UNION SELECT p.logo_id, r.sites_id FROM partners p JOIN partners_rels r ON r.parent_id = p.id AND r.path = 'sites'
  ), pairs AS (
    SELECT DISTINCT media_id, site_id FROM uses WHERE media_id IS NOT NULL AND site_id IS NOT NULL
    UNION
    SELECT m.id, s.id FROM media m CROSS JOIN sites s
    WHERE NOT EXISTS (SELECT 1 FROM uses u WHERE u.media_id = m.id AND u.site_id IS NOT NULL)
  )
  INSERT INTO "media_rels" ("order", "parent_id", "path", "sites_id")
  SELECT row_number() OVER (PARTITION BY media_id ORDER BY site_id), media_id, 'sites', site_id FROM pairs;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "media_rels" CASCADE;`)
}
