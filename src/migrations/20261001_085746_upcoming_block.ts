import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import { randomBytes } from 'crypto'
import type { SQL } from 'drizzle-orm'
import ar from '../../messages/ar.json'
import en from '../../messages/en.json'
import fr from '../../messages/fr.json'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_upcoming_items_icon" AS ENUM('PlugZap', 'Droplets', 'BatteryCharging', 'Cable', 'Zap', 'Sun', 'House', 'Building2', 'Factory', 'Tractor', 'Lightbulb', 'RadioTower', 'Cctv', 'Siren', 'Fingerprint', 'Flame', 'Network', 'Router', 'Wifi', 'Server', 'Phone', 'ScanBarcode', 'Store', 'Monitor', 'Presentation', 'Tv', 'ListOrdered', 'Video', 'Cpu', 'Landmark', 'ShieldCheck', 'MapPin', 'Wrench', 'Headphones', 'Award', 'Heart', 'Eye', 'UserRound', 'Briefcase', 'Newspaper');
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'UserRound';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Briefcase';
  ALTER TYPE "public"."enum_pages_blocks_features_items_icon" ADD VALUE 'Newspaper';
  CREATE TABLE "pages_blocks_upcoming_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_upcoming_items_icon" DEFAULT 'Sun',
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_upcoming_items_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_upcoming" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_upcoming_locales" (
  	"title" varchar,
  	"subtitle" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "pages_blocks_upcoming_items" ADD CONSTRAINT "pages_blocks_upcoming_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_upcoming"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_upcoming_items_locales" ADD CONSTRAINT "pages_blocks_upcoming_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_upcoming_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_upcoming" ADD CONSTRAINT "pages_blocks_upcoming_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_upcoming_locales" ADD CONSTRAINT "pages_blocks_upcoming_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_upcoming"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_upcoming_items_order_idx" ON "pages_blocks_upcoming_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_upcoming_items_parent_id_idx" ON "pages_blocks_upcoming_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_upcoming_items_locales_locale_parent_id_unique" ON "pages_blocks_upcoming_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_upcoming_order_idx" ON "pages_blocks_upcoming" USING btree ("_order");
  CREATE INDEX "pages_blocks_upcoming_parent_id_idx" ON "pages_blocks_upcoming" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_upcoming_path_idx" ON "pages_blocks_upcoming" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_upcoming_locales_locale_parent_id_unique" ON "pages_blocks_upcoming_locales" USING btree ("_locale","_parent_id");`)

  await addUpcomingToHomePages(db)
}


/** Every top-level block table of Pages (their `_order` share one sequence per page). */
const BLOCK_TABLES = [
  'pages_blocks_hero',
  'pages_blocks_stats',
  'pages_blocks_activity_grid',
  'pages_blocks_features',
  'pages_blocks_projects',
  'pages_blocks_cta',
  'pages_blocks_rich_text',
  'pages_blocks_logos',
  'pages_blocks_faq',
  'pages_blocks_partners',
]

/**
 * Existing databases (fresh ones get this from the seed): each site's home
 * page gets the "Bientôt disponible" cards just before its closing call to
 * action (or at the end). Plain SQL against the tables of this migration.
 */
async function addUpcomingToHomePages(db: MigrateUpArgs['db']): Promise<void> {
  const rows = async (query: SQL) => ((await db.execute(query)) as unknown as { rows: Record<string, unknown>[] }).rows
  const messages = { fr, en, ar }
  const cards = [
    { icon: 'UserRound', href: '/espace-client', title: (m: typeof fr) => m.nav.clientArea, body: (m: typeof fr) => m.upcoming.clientArea.card },
    { icon: 'Briefcase', href: '/carrieres', title: (m: typeof fr) => m.nav.careers, body: (m: typeof fr) => m.upcoming.careers.card },
    { icon: 'Newspaper', href: '/blog', title: (m: typeof fr) => m.nav.blog, body: (m: typeof fr) => m.upcoming.news.card },
  ]
  const id = () => randomBytes(12).toString('hex')

  for (const page of await rows(sql`SELECT "id" FROM "pages" WHERE "slug" = 'home'`)) {
    const pageId = page.id as number
    if ((await rows(sql`SELECT 1 FROM "pages_blocks_upcoming" WHERE "_parent_id" = ${pageId}`)).length > 0) continue

    const orders = await rows(
      sql.raw(
        BLOCK_TABLES.map((t) => `SELECT '${t}' AS "table", "_order" FROM "${t}" WHERE "_parent_id" = ${Number(pageId)}`).join(' UNION ALL '),
      ),
    )
    const last = orders.reduce<{ table: string; order: number } | null>(
      (max, r) => (max === null || Number(r._order) > max.order ? { table: String(r.table), order: Number(r._order) } : max),
      null,
    )
    // Before a trailing call to action, else at the end.
    const position = last === null ? 1 : last.table === 'pages_blocks_cta' ? last.order : last.order + 1
    if (last?.table === 'pages_blocks_cta') {
      await db.execute(sql`UPDATE "pages_blocks_cta" SET "_order" = "_order" + 1 WHERE "_parent_id" = ${pageId} AND "_order" >= ${position}`)
    }

    const blockId = id()
    await db.execute(sql`INSERT INTO "pages_blocks_upcoming" ("_order", "_parent_id", "_path", "id")
      VALUES (${position}, ${pageId}, 'layout', ${blockId})`)
    for (const [locale, m] of Object.entries(messages)) {
      await db.execute(sql`INSERT INTO "pages_blocks_upcoming_locales" ("title", "subtitle", "_locale", "_parent_id")
        VALUES (${m.upcoming.title}, ${m.upcoming.subtitle}, ${locale}, ${blockId})`)
    }
    for (const [i, card] of cards.entries()) {
      const itemId = id()
      await db.execute(sql`INSERT INTO "pages_blocks_upcoming_items" ("_order", "_parent_id", "id", "icon", "href")
        VALUES (${i + 1}, ${blockId}, ${itemId}, ${card.icon}, ${card.href})`)
      for (const [locale, m] of Object.entries(messages)) {
        await db.execute(sql`INSERT INTO "pages_blocks_upcoming_items_locales" ("title", "description", "_locale", "_parent_id")
          VALUES (${card.title(m)}, ${card.body(m)}, ${locale}, ${itemId})`)
      }
    }
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_upcoming_items" CASCADE;
  DROP TABLE "pages_blocks_upcoming_items_locales" CASCADE;
  DROP TABLE "pages_blocks_upcoming" CASCADE;
  DROP TABLE "pages_blocks_upcoming_locales" CASCADE;
  ALTER TABLE "pages_blocks_features_items" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_features_items" ALTER COLUMN "icon" SET DEFAULT 'Sun'::text;
  DROP TYPE "public"."enum_pages_blocks_features_items_icon";
  CREATE TYPE "public"."enum_pages_blocks_features_items_icon" AS ENUM('PlugZap', 'Droplets', 'BatteryCharging', 'Cable', 'Zap', 'Sun', 'House', 'Building2', 'Factory', 'Tractor', 'Lightbulb', 'RadioTower', 'Cctv', 'Siren', 'Fingerprint', 'Flame', 'Network', 'Router', 'Wifi', 'Server', 'Phone', 'ScanBarcode', 'Store', 'Monitor', 'Presentation', 'Tv', 'ListOrdered', 'Video', 'Cpu', 'Landmark', 'ShieldCheck', 'MapPin', 'Wrench', 'Headphones', 'Award', 'Heart', 'Eye');
  ALTER TABLE "pages_blocks_features_items" ALTER COLUMN "icon" SET DEFAULT 'Sun'::"public"."enum_pages_blocks_features_items_icon";
  ALTER TABLE "pages_blocks_features_items" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_pages_blocks_features_items_icon" USING "icon"::"public"."enum_pages_blocks_features_items_icon";
  DROP TYPE "public"."enum_pages_blocks_upcoming_items_icon";`)
}
