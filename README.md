# Growing Technologies — Website

Trilingual (Arabic / French / English, RTL-aware) marketing website for
**Growing Technologies**, an ANME-certified solar installer based in Sbeitla,
Tunisia. Built per [`growing-technologies-website-devplan.md`](./growing-technologies-website-devplan.md).

## Stack

| Concern      | Choice                                                          |
| ------------ | --------------------------------------------------------------- |
| Framework    | Next.js **15.4.11** (App Router, TypeScript) — pinned, see below |
| CMS          | Payload 3.90 embedded in the app, admin at `/admin`             |
| Database     | PostgreSQL 16 (`@payloadcms/db-postgres`)                        |
| Styling      | Tailwind CSS v4 + CSS logical properties (RTL)                  |
| i18n         | next-intl (`/ar`, `/fr`, `/en`, default `fr`)                   |
| Animations   | CSS reveal-on-scroll; Framer Motion for interactive widgets     |
| Forms        | Zod + React Hook Form (devis engine, Phase 5)                   |

> **Version pin:** Payload 3.90 supports Next `15.4.11–15.4.x` or `≥16.3.3`, so
> `next` is pinned to the patched `15.4.11` and all `payload`/`@payloadcms/*`
> packages to the same exact version. Upgrade them together.

## Getting started

```bash
npm install
cp .env.example .env.local   # set PAYLOAD_SECRET, SEED_ADMIN_EMAIL/PASSWORD
npm run db:up                # Postgres 16 in Docker on 127.0.0.1:5432
npm run migrate              # create the schema
npm run seed                 # content in fr/ar/en + first admin user
npm run dev                  # site: http://localhost:3000 → /fr
                             # CMS:  http://localhost:3000/admin
```

## CMS (Payload)

**Admin UI** is available in French, Arabic (RTL) and English — it follows the
browser language or the user's preference. **Content** is edited per locale with
the locale picker at the top of each document; a missing `ar`/`en` value falls
back to French.

| Collection         | Purpose                                                       |
| ------------------ | ------------------------------------------------------------- |
| Pages              | Block-built pages (`home`, `about`): hero, stats, features…   |
| Services           | The 5 activities (one per `activityKey`)                      |
| Projects           | Case studies, filterable by activity / region / client type  |
| FAQ, Team          | FAQ entries (by category) and team members                   |
| Demandes de devis  | Leads, with status workflow nouveau → contacté → devis envoyé → gagné/perdu |
| Media              | Images (jpeg/png/webp/avif) with localized alt text          |
| Users              | `admin` (everything) / `editor` (content only, can't delete) |
| Globals            | Site settings (contacts, matricule fiscal, map, stats), Navigation, Footer |

**Roles.** Editors create and edit content and leads; only admins delete
documents, manage users, and edit site settings, navigation and footer.
Anonymous visitors can read published content but never leads or users.

**Schema changes** (adding/changing fields):

```bash
npm run migrate:create -- <name>   # writes src/migrations/<timestamp>_<name>.ts
npm run generate:types             # refresh src/payload-types.ts
npm run generate:importmap         # only if admin components changed
```

In development the schema is auto-pushed to your local DB. In production it is
**never** pushed: pending migrations run automatically at server start
(`prodMigrations`). To seed a production database, run
`NODE_ENV=production npm run seed` so it uses migrations instead of a push.

The seed is idempotent (re-running updates in place) and never changes an
existing user's password.

## Scripts

`dev` · `build` · `start` · `lint` · `typecheck` · `format` · `db:up` / `db:down` ·
`migrate` · `migrate:create` · `seed` · `generate:types` · `generate:importmap`

## Project status (phased roadmap)

- [x] **Phase 0** — Scaffold & tooling.
- [x] **Phase 1** — Payload CMS + PostgreSQL: collections & globals localized
      in fr/ar/en, roles, lead workflow, seed, migrations, trilingual admin.
- [x] **Phase 2** — i18n foundation & layout (locale routing, RTL, fonts,
      header, language switcher, footer).
- [x] **Phase 3** — Core marketing pages (Home, Services ×5, Projects, About,
      Contact, FAQ, legal, devis preview).
- [ ] **Next: wire pages to the CMS** — public pages still read the typed
      modules in `src/content/` (which the seed imports); switch them to the
      Payload Local API with on-publish revalidation.
- [ ] **Phase 5** — Devis (multi-step quote) engine → writes to *Demandes de devis*.
- [ ] **Phase 7** — SEO, performance, Docker deploy (app + Postgres + media).

## Structure

```
src/
├─ app/
│  ├─ (frontend)/[locale]/  Localized public routes
│  └─ (payload)/            Payload admin + REST/GraphQL API (generated)
├─ collections/             Payload collections
├─ globals/                 Payload globals (SiteSettings, Navigation, Footer)
├─ blocks/                  Page-builder block configs (renderers: next phase)
├─ cms/                     Access control, shared fields, options, labels
├─ migrations/              Database migrations (generated)
├─ payload.config.ts        CMS config (localization, admin i18n, Postgres)
├─ payload-types.ts         Generated types
├─ components/              UI primitives, layout, sections, motion
├─ content/                 Typed seed content (mirrors the collections)
├─ i18n/                    Locale config (shared with the CMS), routing
└─ middleware.ts            Locale detection (skips /admin and /api)
messages/                   UI-chrome catalogs: ar.json, fr.json, en.json
scripts/seed.ts             Idempotent CMS seed
docker-compose.yml          Local Postgres
```

## Language rule

Code, comments and commits in English. All user-facing copy is AR/FR/EN.
Business/legal text (mentions légales, privacy) is authored in French.
