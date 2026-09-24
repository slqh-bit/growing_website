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
| Forms        | Zod + React Hook Form (shared client/server validation)          |
| Email        | Nodemailer over SMTP (Payload email adapter)                    |

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

**Everything on the public site comes from the CMS** (UI chrome such as button
labels and form text stays in `messages/*.json`):

| Where it's edited            | What it controls                                              |
| ---------------------------- | ------------------------------------------------------------- |
| Pages → `home`, `about`      | Home / About sections (hero, stats, features, projects, CTA…) |
| Pages → any other slug       | A new page at `/{locale}/{slug}`, no code needed               |
| Services / Projects / FAQ / Team | Their listing and detail pages, footer activities, related projects |
| Site settings                | Company name, contacts, address, map, hours, key figures, matricule |
| Navigation / Footer          | Header menu, footer links and tagline                         |

The `home` page cannot be deleted (it is the site root).

### Rendering & caching

Public pages use **incremental static regeneration without build-time database
access**: `next build` never queries Postgres (so the Docker image builds without
a DB); each page is rendered on its first visit, then served from cache.

Every CMS query (`src/lib/cms/queries.ts`) is cached and tagged with the
collections/globals it reads. When an editor saves, a Payload hook
(`src/cms/revalidate.ts`) invalidates that tag **after the transaction commits**,
so the change is live on the next request — only for the pages that use it, and
only in the edited language. Public reads go through `overrideAccess: false`, so
the site can never show what an anonymous visitor isn't allowed to read.

> Changes made **outside the app** (seed, manual SQL) are not seen by the cache:
> saves in the admin revalidate automatically, but the seed does not. After
> re-seeding a running site, clear both cache layers — the data cache
> (`.next/cache`, which survives `next build`) and the rendered pages (written
> under `.next/server`, which survive restarts): `rm -rf .next/cache && npm run
> build`, then restart. A fresh Docker image build starts with empty caches.

**Schema changes** (adding/changing fields):

```bash
npm run migrate:create -- <name>   # writes src/migrations/<timestamp>_<name>.ts
npm run generate:types             # refresh src/payload-types.ts
npm run generate:importmap         # only if admin components changed
```

In development the schema is auto-pushed to your local DB. In production it is
**never** pushed: pending migrations run automatically at server start
(`prodMigrations`).

> ⚠️ Never run `npm run dev` against the **production** database. Dev mode
> pushes the schema and leaves a "dev" marker in `payload_migrations`; the next
> production start then stops at an interactive migration prompt (and hangs in
> a container). If it happens: `DELETE FROM payload_migrations WHERE batch = -1;`

> ⚠️ `SERVER_URL` (or `NEXT_PUBLIC_SITE_URL`) must be the exact origin the admin
> is opened from. Payload only accepts the admin cookie from that origin, so a
> mismatch (e.g. `www.` vs bare domain, or another port) makes every save fail
> with *"Vous n'êtes pas autorisé à effectuer cette action"* (403).

To seed a production database, run
`NODE_ENV=production npm run seed` so it uses migrations instead of a push.

The seed is idempotent (re-running updates in place) and never changes an
existing user's password.

## Devis (quote requests)

`/{locale}/devis` is a 4-step form: **activity → technical needs (adapted to the
activity, with tooltips) → site & contact → review + consent**. Service pages link
to it with the activity preselected (`/devis?activite=pompage`).

| Piece | Where |
| --- | --- |
| Field catalogue (labels, units, tooltips in fr/ar/en) | `src/lib/devis/fields.ts` |
| Option lists (shared with the admin) | `src/lib/devis/options.ts` |
| Validation (per step + full, message keys) | `src/lib/devis/schema.ts` |
| Server action (anti-spam, rate limit, save) | `src/lib/devis/actions.ts` |
| Team email, client auto-reply, Telegram | `src/lib/devis/notify.ts` |
| Form UI | `src/components/devis/` |

On submit the server re-validates everything, stores the lead in **Demandes de
devis** (status *nouveau*, reference `GT-YYMMDD-XXXX`) and answers immediately;
notifications are sent right after the response, each channel independently
(a mail outage never loses a lead):

- **Team email** (French, to `DEVIS_NOTIFY_EMAIL`) with the full summary, a
  reply-to set to the client and a link to the lead in the admin.
- **Client auto-reply** (French, only if an email was given) — reference and next
  steps only; free-text fields are never echoed back (no spam relay).
- **Telegram** message if `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` are set.

**Anti-spam:** hidden honeypot field and a minimum fill time (bots get a fake
success and nothing is stored), plus a per-IP limit of 5 requests / 15 min.
The client IP comes from `X-Forwarded-For`, so the app must only be reachable
through the reverse proxy (Phase 7); the limiter is in-memory (single instance).

Phone numbers accept spaces, `+216`/`00216` and Arabic-Indic digits, and are
stored as `+216XXXXXXXX`.

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
- [x] **CMS wiring** — every public page reads from Payload (cached, tag-based
      revalidation on save), block renderers for Pages, editor-created pages at
      `/{slug}`, CMS images via `next/image`, localized error state, `/team`.
- [x] **Phase 5** — Devis engine: 4-step trilingual form, shared Zod validation,
      server action, anti-spam, team/client emails, Telegram, admin workflow.
- [ ] **Phase 7** — SEO, performance, Docker deploy (app + Postgres + media).

## Structure

```
src/
├─ app/
│  ├─ (frontend)/[locale]/  Localized public routes
│  └─ (payload)/            Payload admin + REST/GraphQL API (generated)
├─ collections/             Payload collections
├─ globals/                 Payload globals (SiteSettings, Navigation, Footer)
├─ blocks/                  Page-builder block configs + renderers
├─ cms/                     Access control, fields, options, labels, revalidation hooks
├─ migrations/              Database migrations (generated)
├─ payload.config.ts        CMS config (localization, admin i18n, Postgres)
├─ payload-types.ts         Generated types
├─ lib/cms/                 Cached CMS queries, media helpers, page helpers
├─ components/              UI primitives, layout, sections, motion, cms (RichText, images)
├─ i18n/                    Locale config (shared with the CMS), routing
└─ middleware.ts            Locale detection (skips /admin and /api)
messages/                   UI-chrome catalogs: ar.json, fr.json, en.json
scripts/seed.ts             Idempotent CMS seed (content in scripts/seed-data/)
docker-compose.yml          Local Postgres
```

## Language rule

Code, comments and commits in English. All user-facing copy is AR/FR/EN.
Business/legal text (mentions légales, privacy) is authored in French.
