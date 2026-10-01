import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_sites_business_type" AS ENUM('Electrician', 'HomeAndConstructionBusiness', 'ProfessionalService', 'Store', 'LocalBusiness');
  ALTER TABLE "sites" ADD COLUMN "business_type" "enum_sites_business_type" DEFAULT 'LocalBusiness' NOT NULL;
  ALTER TABLE "sites" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "sites" ADD CONSTRAINT "sites_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "sites_og_image_idx" ON "sites" USING btree ("og_image_id");`)

  // Existing sites keep being announced as they should: Growing as an electrician
  // (as before this migration), Hikview as a professional services company.
  await db.execute(sql`UPDATE "sites" SET "business_type" = 'Electrician' WHERE "key" = 'growing'`)
  await db.execute(sql`UPDATE "sites" SET "business_type" = 'ProfessionalService' WHERE "key" = 'hikview'`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sites" DROP CONSTRAINT "sites_og_image_id_media_id_fk";
  
  DROP INDEX "sites_og_image_idx";
  ALTER TABLE "sites" DROP COLUMN "business_type";
  ALTER TABLE "sites" DROP COLUMN "og_image_id";
  DROP TYPE "public"."enum_sites_business_type";`)
}
