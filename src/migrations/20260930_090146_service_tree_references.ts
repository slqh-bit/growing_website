import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" ADD COLUMN "parent_id" integer;
  ALTER TABLE "services" ADD COLUMN "show_public_references" boolean DEFAULT false;
  ALTER TABLE "projects" ADD COLUMN "client" varchar;
  ALTER TABLE "projects" ADD COLUMN "client_name_public" boolean DEFAULT true;
  ALTER TABLE "sites_locales" ADD COLUMN "services_intro" varchar;
  ALTER TABLE "services" ADD CONSTRAINT "services_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "services_parent_idx" ON "services" USING btree ("parent_id");`)

  // Data (existing databases): each site's Services intro, and Growing's home
  // grid title now that it has four activities (only if never edited).
  await db.execute(sql`
  UPDATE "sites_locales" sl SET "services_intro" = CASE sl."_locale"
      WHEN 'ar' THEN 'أربعة أنشطة، من الضخّ الشمسي إلى المحطات الكهروضوئية.'
      WHEN 'en' THEN 'Four activities, from solar pumping to utility-scale PV plants.'
      ELSE 'Quatre activités, du pompage solaire aux centrales photovoltaïques.' END
  FROM "sites" s WHERE s."id" = sl."_parent_id" AND s."key" = 'growing' AND sl."services_intro" IS NULL;

  UPDATE "sites_locales" sl SET "services_intro" = CASE sl."_locale"
      WHEN 'ar' THEN 'ستة مجالات خبرة، من الأمن الإلكتروني إلى المشاريع العمومية.'
      WHEN 'en' THEN 'Six areas of expertise, from electronic security to public-sector projects.'
      ELSE 'Six domaines d''expertise, de la sécurité électronique aux projets publics.' END
  FROM "sites" s WHERE s."id" = sl."_parent_id" AND s."key" = 'hikview' AND sl."services_intro" IS NULL;

  UPDATE "pages_blocks_activity_grid_locales" SET "title" = 'Nos quatre activités' WHERE "title" = 'Nos cinq activités';
  UPDATE "pages_blocks_activity_grid_locales" SET "title" = 'Our four activities' WHERE "title" = 'Our five activities';
  UPDATE "pages_blocks_activity_grid_locales" SET "title" = 'أنشطتنا الأربعة' WHERE "title" = 'أنشطتنا الخمسة';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" DROP CONSTRAINT "services_parent_id_services_id_fk";
  
  DROP INDEX "services_parent_idx";
  ALTER TABLE "services" DROP COLUMN "parent_id";
  ALTER TABLE "services" DROP COLUMN "show_public_references";
  ALTER TABLE "projects" DROP COLUMN "client";
  ALTER TABLE "projects" DROP COLUMN "client_name_public";
  ALTER TABLE "sites_locales" DROP COLUMN "services_intro";`)
}
