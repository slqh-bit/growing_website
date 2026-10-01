import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'
import ar from '../../messages/ar.json'
import en from '../../messages/en.json'
import fr from '../../messages/fr.json'

/**
 * Data only: Hikview's home page buttons lead to the quote form now that its
 * services have one (Phase 5b), as the seed does for new databases. Only the
 * buttons still holding the seeded link and label are changed, so an admin
 * edit is never overwritten.
 */
const labels = [
  { locale: 'fr', from: fr.nav.contact, to: fr.common.requestQuote },
  { locale: 'en', from: en.nav.contact, to: en.common.requestQuote },
  { locale: 'ar', from: ar.nav.contact, to: ar.common.requestQuote },
]

const hikviewHome = sql`SELECT p."id" FROM "pages" p JOIN "sites" s ON s."id" = p."site_id" WHERE s."key" = 'hikview' AND p."slug" = 'home'`

async function swap(db: MigrateUpArgs['db'], fromHref: string, toHref: string, direction: 'up' | 'down') {
  for (const { locale, from, to } of labels) {
    const [oldLabel, newLabel] = direction === 'up' ? [from, to] : [to, from]
    await db.execute(sql`UPDATE "pages_blocks_hero_locales" l SET "primary_cta_label" = ${newLabel}
      FROM "pages_blocks_hero" h
      WHERE l."_parent_id" = h."id" AND h."_parent_id" IN (${hikviewHome}) AND h."primary_cta_href" = ${fromHref}
        AND l."_locale" = ${locale} AND l."primary_cta_label" = ${oldLabel}`)
    await db.execute(sql`UPDATE "pages_blocks_cta_locales" l SET "button_label" = ${newLabel}
      FROM "pages_blocks_cta" c
      WHERE l."_parent_id" = c."id" AND c."_parent_id" IN (${hikviewHome}) AND c."button_href" = ${fromHref}
        AND l."_locale" = ${locale} AND l."button_label" = ${oldLabel}`)
  }
  await db.execute(sql`UPDATE "pages_blocks_hero" SET "primary_cta_href" = ${toHref}
    WHERE "_parent_id" IN (${hikviewHome}) AND "primary_cta_href" = ${fromHref}`)
  await db.execute(sql`UPDATE "pages_blocks_cta" SET "button_href" = ${toHref}
    WHERE "_parent_id" IN (${hikviewHome}) AND "button_href" = ${fromHref}`)
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await swap(db, '/contact', '/devis', 'up')
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await swap(db, '/devis', '/contact', 'down')
}
