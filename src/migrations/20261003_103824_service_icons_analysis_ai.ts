import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Two icons for the services added to Hikview's catalogue (Amped FIVE, AI
 * solutions). IF NOT EXISTS: a dev server may already have pushed them.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE IF NOT EXISTS 'ScanSearch' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE IF NOT EXISTS 'BrainCircuit' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_upcoming_items_icon" ADD VALUE IF NOT EXISTS 'ScanSearch' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_pages_blocks_upcoming_items_icon" ADD VALUE IF NOT EXISTS 'BrainCircuit' BEFORE 'ShieldCheck';
  ALTER TYPE "public"."enum_services_sections_icon" ADD VALUE IF NOT EXISTS 'ScanSearch';
  ALTER TYPE "public"."enum_services_sections_icon" ADD VALUE IF NOT EXISTS 'BrainCircuit';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE IF NOT EXISTS 'ScanSearch';
  ALTER TYPE "public"."enum_services_icon" ADD VALUE IF NOT EXISTS 'BrainCircuit';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_features_items" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_features_items" ALTER COLUMN "icon" SET DEFAULT 'Sun'::text;
  DROP TYPE "public"."enum_pages_blocks_features_items_icon";
  CREATE TYPE "public"."enum_pages_blocks_features_items_icon" AS ENUM('PlugZap', 'Droplets', 'BatteryCharging', 'Cable', 'Zap', 'Sun', 'House', 'Building2', 'Factory', 'Tractor', 'Lightbulb', 'RadioTower', 'Cctv', 'Siren', 'Fingerprint', 'Flame', 'Network', 'Router', 'Wifi', 'Server', 'Phone', 'ScanBarcode', 'Store', 'Monitor', 'Presentation', 'Tv', 'ListOrdered', 'Video', 'Cpu', 'Landmark', 'ShieldCheck', 'MapPin', 'Wrench', 'Headphones', 'Award', 'Heart', 'Eye', 'UserRound', 'Briefcase', 'Newspaper');
  ALTER TABLE "pages_blocks_features_items" ALTER COLUMN "icon" SET DEFAULT 'Sun'::"public"."enum_pages_blocks_features_items_icon";
  ALTER TABLE "pages_blocks_features_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_pages_blocks_features_items_icon" USING "icon"::"public"."enum_pages_blocks_features_items_icon";
  ALTER TABLE "pages_blocks_upcoming_items" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_upcoming_items" ALTER COLUMN "icon" SET DEFAULT 'Sun'::text;
  DROP TYPE "public"."enum_pages_blocks_upcoming_items_icon";
  CREATE TYPE "public"."enum_pages_blocks_upcoming_items_icon" AS ENUM('PlugZap', 'Droplets', 'BatteryCharging', 'Cable', 'Zap', 'Sun', 'House', 'Building2', 'Factory', 'Tractor', 'Lightbulb', 'RadioTower', 'Cctv', 'Siren', 'Fingerprint', 'Flame', 'Network', 'Router', 'Wifi', 'Server', 'Phone', 'ScanBarcode', 'Store', 'Monitor', 'Presentation', 'Tv', 'ListOrdered', 'Video', 'Cpu', 'Landmark', 'ShieldCheck', 'MapPin', 'Wrench', 'Headphones', 'Award', 'Heart', 'Eye', 'UserRound', 'Briefcase', 'Newspaper');
  ALTER TABLE "pages_blocks_upcoming_items" ALTER COLUMN "icon" SET DEFAULT 'Sun'::"public"."enum_pages_blocks_upcoming_items_icon";
  ALTER TABLE "pages_blocks_upcoming_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_pages_blocks_upcoming_items_icon" USING "icon"::"public"."enum_pages_blocks_upcoming_items_icon";
  ALTER TABLE "services_sections" ALTER COLUMN "icon" SET DATA TYPE text;
  DROP TYPE "public"."enum_services_sections_icon";
  CREATE TYPE "public"."enum_services_sections_icon" AS ENUM('PlugZap', 'Droplets', 'BatteryCharging', 'Cable', 'Zap', 'Sun', 'House', 'Building2', 'Factory', 'Tractor', 'Lightbulb', 'RadioTower', 'Cctv', 'Siren', 'Fingerprint', 'Flame', 'Network', 'Router', 'Wifi', 'Server', 'Phone', 'ScanBarcode', 'Store', 'Monitor', 'Presentation', 'Tv', 'ListOrdered', 'Video', 'Cpu', 'Landmark');
  ALTER TABLE "services_sections" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_services_sections_icon" USING "icon"::"public"."enum_services_sections_icon";
  ALTER TABLE "services" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "services" ALTER COLUMN "icon" SET DEFAULT 'Sun'::text;
  DROP TYPE "public"."enum_services_icon";
  CREATE TYPE "public"."enum_services_icon" AS ENUM('PlugZap', 'Droplets', 'BatteryCharging', 'Cable', 'Zap', 'Sun', 'House', 'Building2', 'Factory', 'Tractor', 'Lightbulb', 'RadioTower', 'Cctv', 'Siren', 'Fingerprint', 'Flame', 'Network', 'Router', 'Wifi', 'Server', 'Phone', 'ScanBarcode', 'Store', 'Monitor', 'Presentation', 'Tv', 'ListOrdered', 'Video', 'Cpu', 'Landmark');
  ALTER TABLE "services" ALTER COLUMN "icon" SET DEFAULT 'Sun'::"public"."enum_services_icon";
  ALTER TABLE "services" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_services_icon" USING "icon"::"public"."enum_services_icon";`)
}
