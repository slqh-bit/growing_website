import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_style" AS ENUM('full', 'compact');
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "style" "enum_pages_blocks_hero_style" DEFAULT 'compact' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_hero" DROP COLUMN "style";
  DROP TYPE "public"."enum_pages_blocks_hero_style";`)
}
