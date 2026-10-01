# Growing Technologies & Hikview Engineering — Websites

Trilingual (Arabic / French / English, RTL-aware) marketing websites for the
group: **Growing Technologies** (ANME-certified solar installer) and **Hikview
Engineering** (electronic security, networks, technology solutions), both based
in Sbeitla, Tunisia. One Next.js + Payload app serves every site, each on its
own domain (see [Multi-site](#multi-site)). Built per
[`growing-technologies-website-devplan.md`](./growing-technologies-website-devplan.md)
and the group platform plan (multi-site, phases 1–9).

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
| Hosting      | Docker Compose on one VPS: Caddy (HTTPS) + app + Postgres + backups |
| Analytics    | Plausible (optional, cookie-free)                               |
| Tests        | node:test (unit) + Playwright (e2e), GitHub Actions CI          |

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
| Pages              | Block-built pages per site (`home`, `about`…): hero, stats, features, partners… |
| Services           | Each site's activities / areas, and sub-services (`parent` → `/services/<area>/<sub>`); page sections with anchors (`#commercial`); `activityKey` links one to the quote form; "Chez notre société sœur" cross-selling to another site's services |
| Projects           | Case studies (named or anonymous client), filterable by service / region / client type |
| Partenaires & marques | Brands, manufacturers, own products: partners strip block + logos on linked service pages |
| FAQ, Team          | FAQ entries (by category) and team members                   |
| Demandes de devis  | Leads per site, with status workflow nouveau → contacté → devis envoyé → gagné/perdu |
| Formulaires de devis | Quote forms built in the admin (questions, choices, conditions), linked to services |
| Media              | Images (jpeg/png/webp/avif) with localized alt text          |
| Users              | `admin` (everything) / `editor` (content only, can't delete) |
| Sites              | One per website: domains, company identity, contacts, map, key figures, logo, colours, menu, footer |
| Redirections       | Old path → new path (all languages, per site), followed when a page isn't found |
| Groupe (global)    | Group name, "Le groupe" page (`/groupe` on every site), member companies, footer group band |

**Roles.** Editors create and edit content and leads; only admins delete
documents, manage users, and edit sites (including their menu and footer).
Every content document belongs to one site (`site` field): an editor whose
**Sites gérés** is set only sees and edits those sites' content (empty = all).
Anonymous visitors can read published content but never leads or users.

**Everything on the public site comes from the CMS** (UI chrome such as button
labels and form text stays in `messages/*.json`):

| Where it's edited            | What it controls                                              |
| ---------------------------- | ------------------------------------------------------------- |
| Pages → `home`, `about`      | Home / About sections (hero, stats, features, projects, CTA…) |
| Pages → any other slug       | A new page at `/{locale}/{slug}`, no code needed               |
| Services / Projects / FAQ / Team | Their listing and detail pages, footer activities, related projects |
| Sites                        | Per site: company name, tagline, contacts, address, map, hours, key figures, matricule, logo, favicon, colours, domains |
| Sites → Menu / Pied de page  | Header menu, footer links and tagline (per site)              |
| Redirections                 | Retired URLs (e.g. `/services/basse-tension` → `/services/installation-raccordee#commercial`) |

The `home` page cannot be deleted (it is the site root).

## Multi-site

Every public URL is served for the site that owns the requested domain:

- `src/middleware.ts` rewrites `/{locale}/…` to `/{hostname}/{locale}/…`
  internally (`app/(frontend)/[domain]/[locale]`), so each domain gets its own
  statically cached pages; browser URLs don't change.
- Pages resolve the hostname to a site (`src/lib/site.ts`) from **Sites →
  Noms de domaine** in the admin (`www.` is matched too). Unknown domains — and
  plain `localhost` — show the site marked **Site par défaut**.
- The site's **colours** (Sites → Marque) set the hue/intensity of the CSS
  palettes (`src/lib/theme.ts`, `src/styles/globals.css`); lightness steps are
  fixed, so contrast holds for any colour. Logo, dark-mode logo, favicon and
  initials badge come from the same tab. Saving a site updates the live pages.

**Local development** — `*.localhost` resolves to your machine in Chrome,
Firefox and Edge, so no hosts-file edit is needed:

| URL | Site |
| --- | --- |
| `http://localhost:3000` | the default site (Growing) |
| `http://growing.localhost:3000`, `http://hikview.localhost:3000` | that site |
| `http://localhost:3000/fr?site=hikview` | preview a site on plain localhost (dev only, remembered in a cookie; `?site=` clears it) |

Log in to the admin on the origin set in `NEXT_PUBLIC_SITE_URL` / `SERVER_URL`
(e.g. `http://localhost:3000/admin`), not on a `*.localhost` host.

Every content document (page, service, project, FAQ, team member) belongs to
one site, and each site's queries, sitemap and robots.txt only see their own.
The quote form offers the activities of the current site's services; a site
without any shows a contact prompt. Quote requests still belong to the
default site until the devis learns about sites (Phase 5a).

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

The seed is create-only: it adds missing sites, pages, services, projects,
FAQ entries and redirects, and never overwrites what was edited in the admin
(nor an existing user's password). Content changes for existing databases
ship as data migrations instead (e.g. the Growing catalogue restructure).

## Devis (quote requests)

`/{locale}/devis` is a 4-step form: **service → technical needs → site &
contact → review + consent**. Step 1 lists the site's services that have a
quote form; step 2 asks that form's questions. Service pages link to it with the
service preselected (`/devis?service=pompage-solaire`; older `?activite=` links
still work).

**Forms are built in the admin** (Demandes → **Formulaires de devis**), then
linked to a service (Services → **Formulaire de devis**). Each question has a
key, a type (short/long text, number with unit and min/max, drop-down, single
or multiple choice, checkbox, date), a label and help text in fr/ar/en, a
"required" flag, an "at least one of…" group (e.g. bill OR consumption) and an
optional "only show if <question> = <value>" condition. A service without a
form gets a "Contact" button instead (an area whose sub-services have forms
links to `/devis`).

Seeded forms: Growing's 4 activities and Hikview's 15 (one per sub-service,
the IoT form shared by both IoT pages, and the public-sector/B2G form).

Every form also offers, after its questions, **attachments** (Formulaire →
Pièces jointes: optional, required or off, with its own label, e.g. "Cahier
des charges (CDC)"): up to 5 files, 10 MB each and 20 MB in all, PDF, JPG,
PNG, WebP, HEIC, Word (.docx), Excel (.xlsx) or DWG. The browser checks type
and size; the server checks them again, checks each file's first bytes match
its extension, and Payload checks the content type. Files are private
(**Demandes → Pièces jointes clients**, staff of the request's site only),
stored in `quotes/attachments/` next to the quote PDFs (same Docker volume and
backup). The contact step has a **site visit** checkbox.

| Piece | Where |
| --- | --- |
| Form definition → validation, visibility, summaries | `src/lib/devis/form-def.ts` |
| Step schemas (service, answers, contact, consent) | `src/lib/devis/schema.ts` |
| The site's services with their forms | `src/lib/devis/choices.ts` |
| Server action (site from the host, anti-spam, rate limit, files, save) | `src/lib/devis/actions.ts` |
| Attachment rules (types, sizes, signatures) | `src/lib/devis/attachments.ts` |
| Team email, client auto-reply, Telegram (per site) | `src/lib/devis/notify.ts` |
| Admin view of a request's answers | `src/components/admin/devis-answers.tsx` |
| Form UI | `src/components/devis/` |
| Seeded forms | `scripts/seed-data/devis-forms.ts`, `hikview-devis-forms.ts` |
| Legacy typed form (display of pre-builder requests) | `src/lib/devis/fields.ts` |

On submit the server finds the site from the request's host, re-reads the
service's form (never trusting the browser), re-validates everything and
stores the lead in **Demandes de devis**: status *nouveau*, site, service, the
answers and a **snapshot of the form** (so it stays readable after the form is
edited), reference with the site's initials (`GT-YYMMDD-XXXX`,
`HE-YYMMDD-XXXX`…). It answers immediately; notifications are sent right after
the response, each channel independently (a mail outage never loses a lead):

- **Team email** (French) to the site's team — **Sites → Demandes de devis →
  E-mails de l'équipe**; else, for the default site, `DEVIS_NOTIFY_EMAIL`;
  else the site's email — with the full summary, the client's files attached
  (up to 10 MB in all; beyond that they are listed, to open in the admin), a
  reply-to set to the client and a link to the lead in the admin.
- **Client auto-reply** (French, only if an email was given), in the site's
  colours and name — reference and next steps only; free-text answers are
  never echoed back (no spam relay).
- **Telegram** message to the site's group (**Identifiant du groupe Telegram**;
  the default site falls back to `TELEGRAM_CHAT_ID`) when `TELEGRAM_BOT_TOKEN`
  is set.

Editors only see the requests of the sites they manage. The tracking page
(`/suivi`) only finds the current site's requests.

**Anti-spam:** hidden honeypot field and a minimum fill time (bots get a fake
success and nothing is stored), plus a per-IP limit of 5 requests / 15 min.
The client IP comes from `X-Real-IP` (overwritten by Caddy, see `deploy/`), so
the app must only be reachable through the reverse proxy; the limiter is
in-memory (single instance).

Phone numbers accept spaces, `+216`/`00216` and Arabic-Indic digits, and are
stored as `+216XXXXXXXX`; numbers in answers accept Arabic-Indic digits and
decimal commas.

## Tender documents

Each company keeps its tender documents in **Appels d'offres → Documents
administratifs**: tax and CNSS certificates, RNE extract, certificates,
completion certificates, datasheets. Each document has a type, an optional
validity date and a visibility:

- **Public**: listed on the site's `/{locale}/documents` page and downloadable;
- **On request**: listed without its file, with a link to the contact page;
- **Internal**: team only.

An expired document is no longer listed or downloadable, whatever its
visibility (checked by the collection's read access, to the day in Tunis
time). The page also shows the company's legal identity (Sites → Entreprise,
incl. the RNE number). Service pages with **Lien vers les documents
administratifs** (B2G, PV plants) show a box linking to it, and every footer
links to it.

**Expiry alerts:** a Payload job (`src/jobs/document-expiry.ts`) runs daily at
07:00 (`TZ`, Africa/Tunis in production) inside the app and emails the site's
team (same recipients and Telegram group as quote requests) when a document
is 30 days, then 7 days from expiring, and once expired — each level once;
entering a new date starts over. The admin dashboard lists the documents to
renew, and the list shows a validity badge. Files are private uploads stored
in `quotes/company-documents/` (same volume and backup as quote PDFs).

## SEO, performance & analytics

- **Each site is indexed on its own:** canonical URLs, `hreflang` alternates
  (incl. `x-default`), `/sitemap.xml` and `/robots.txt` use the site's origin —
  **Sites → Adresse publique**, else its first domain (so a second site never
  borrows the first one's address), else `NEXT_PUBLIC_SITE_URL` (development).
- **Metadata:** per-page title/description/Open Graph and Twitter card; CMS
  `seo` fields override. Share image: the page's own, else **Sites → Image de
  partage par défaut**, else one generated at `/{locale}/og?title=…` in the
  site's colours (Arabic titles fall back to the French tagline: the image
  renderer has no Arabic shaping).
- **robots.txt:** admin and API disallowed, except uploaded images
  (`/api/media/file/`) and public company documents.
- **JSON-LD:** each company as the schema.org type chosen in **Sites →
  Entreprise → Type d'activité** (Growing: `Electrician`, Hikview:
  `ProfessionalService`) with logo, tax ID, RNE, address, geo and the group as
  `parentOrganization`; a `WebSite` entity; the group with its
  `subOrganization`s on `/groupe`; `Service` + breadcrumbs on service pages,
  breadcrumbs on projects.
- **Fonts:** Inter and IBM Plex Sans Arabic are self-hosted (no build-time
  network). The Arabic font only downloads on pages with Arabic text, and
  size-adjusted system fallbacks prevent layout shift when it swaps in.
- **Lighthouse (mobile, simulated 4G), both sites:** performance 91–97, and
  100 for accessibility, best practices and SEO (home, service, sub-service in
  Arabic, devis, documents and group pages, with each site on its own origin).
- **Analytics:** set `PLAUSIBLE_DOMAIN` to load Plausible (no cookies, no
  consent banner). Each site with an address is measured under its own domain
  (add both in Plausible); `PLAUSIBLE_DOMAIN` is used for a site without one. A
  `Devis` goal fires on each successful quote request (props: activity,
  locale) — add it under *Goals* in Plausible.

## Tests & CI

```bash
npm test                                   # unit: devis forms and schema, sites, phone, rate limit…
npm run build && NODE_ENV=production npm run seed
npm run test:e2e                           # Playwright, desktop + mobile, on :3100
```

`.github/workflows/ci.yml` runs lint, typecheck, unit tests and a build without a
database; the Playwright suite against a seeded Postgres; and a Docker job that
builds the production image, boots it on an empty database (migrations), seeds
it with the tools image and checks the pages.

## Deployment

Production runs with Docker Compose on a single VPS — see
**[DEPLOY.md](./DEPLOY.md)** (first deploy, updates, backups, restore drill).

## Scripts

`dev` · `build` · `start` · `lint` · `typecheck` · `test` · `test:e2e` · `format` ·
`db:up` / `db:down` · `migrate` · `migrate:create` · `seed` · `generate:types` ·
`generate:importmap`

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
- [x] **Phase 7** — SEO (metadata, hreflang, sitemap, robots, JSON-LD),
      mobile Lighthouse ≥ 90, Plausible, Docker/Caddy/backup deployment kit,
      unit + e2e tests and CI.

Group platform (multi-site):

- [x] **Phase 1** — Multi-site foundation: `Sites` collection (replaces the
      Site settings global, data migrated), hostname → site routing, per-site
      theme, logo, favicon, tagline and metadata origin, `Users.sites`.
- [x] **Phase 2** — Per-site content (`site` on pages, services, projects,
      FAQ, team; editors limited to their sites), per-site menu/footer,
      sitemap and robots; Growing's 4 activities (BT/MT merged into
      "Installations raccordées" sections, new "Centrales photovoltaïques"),
      `Redirects` with 301/308 for the retired pages, `Partners` + partners
      block; Hikview starter pages.
- [x] **Phase 3** — Hikview site: service tree (6 areas → 15 sub-services at
      `/services/<area>/<sub>`, old flat URLs redirect), shared service page
      template, B2G page with every public-sector reference, named project
      clients, per-site Services intro, Hikview catalogue seeded in fr/ar/en.
- [x] **Phase 4** — Group layer: `Group` global, `/groupe` page on every site,
      footer group band linking to the sister company, per-service
      cross-selling to the other site (absolute links), logos keep their own
      brand colours on any site.
- [x] **Phase 5a** — Quote form builder: `DevisForms` (questions, choices,
      "at least one of", "only show if"), dynamic form + Zod from the
      definition, answers + form snapshot on each request, admin answers view,
      per-site references, routing (e-mails, Telegram) and branded e-mails;
      Growing's 4 forms (incl. PV plants and street lighting) created by a
      data migration.
- [x] **Phase 5b** — Hikview's 15 quote forms (seeded), client attachments
      (private `DevisAttachments`, per-form label/mode, content checks, sent
      with the team email), site-visit request, date answers in local format,
      area pages linking to the quote form.
- [x] **Phase 6** — Tender documents: `CompanyDocuments` (type, validity,
      public / on request / internal), `/documents` page per company with its
      legal identity, links from footers and the B2G / PV plant pages, daily
      expiry alerts (Payload job, email + Telegram) and dashboard warning.
- [x] **Phase 7** — SEO per site: origin never shared between sites,
      schema.org type per company + group (`parentOrganization`,
      `subOrganization`), `WebSite`, default share image per site (uploaded or
      generated in its colours), robots open to images and public documents,
      Plausible per domain; Lighthouse ≥ 90 on both sites.

## Structure

```
src/
├─ app/
│  ├─ (frontend)/[domain]/[locale]/  Public routes, per site (hostname) and locale
│  └─ (payload)/            Payload admin + REST/GraphQL API (generated)
├─ collections/             Payload collections
├─ sites/                   Site keys + hostname → site matching (shared with the middleware)
├─ blocks/                  Page-builder block configs + renderers
├─ cms/                     Access control, fields, options, labels, revalidation hooks
├─ migrations/              Database migrations (generated)
├─ payload.config.ts        CMS config (localization, admin i18n, Postgres)
├─ payload-types.ts         Generated types
├─ lib/cms/                 Cached CMS queries, media helpers, page helpers
├─ components/              UI primitives, layout, sections, motion, cms (RichText, images)
├─ i18n/                    Locale config (shared with the CMS), routing
└─ middleware.ts            Locale detection + site rewrite (skips /admin and /api)
messages/                   UI-chrome catalogs: ar.json, fr.json, en.json
scripts/seed.ts             Idempotent CMS seed (content in scripts/seed-data/)
tests/                      unit/ (node:test) and e2e/ (Playwright)
docker-compose.yml          Local Postgres (development)
Dockerfile                  Production image (Next.js standalone)
deploy/                     Production compose, Caddyfile, backup/restore scripts
```

## Language rule

Code, comments and commits in English. All user-facing copy is AR/FR/EN.
Business/legal text (mentions légales, privacy) is authored in French.
