# Growing Technologies — Website Development Plan

**Prepared for:** Claude Code (build agent)
**Owner:** Slah — Growing Technologies (ANME-certified solar installer, Sbeitla, Tunisia)
**Date:** 2026-09-21
**Deliverable:** Trilingual (AR/FR/EN, RTL) marketing website + devis (quote-request) system, managed through a self-hosted headless CMS.

---

## 0. How to use this document

This is a **build spec + phased roadmap** for Claude Code. Build **phase by phase, in order**. Do not skip ahead. At the end of each phase there is an **Acceptance checklist** — every box must pass before starting the next phase. Unbuilt sections ship as polished **"Coming soon"** placeholders (phased-rollout mindset), never broken links.

Language rule for this project: **code, comments, commits, and docs in English**; **all user-facing copy in AR/FR/EN via the CMS**; **French for any generated business/legal text** (mentions légales, CGU, devis).

---

## 1. Product goals

1. Present Growing Technologies as a credible ANME-certified solar company across its five activities:
   - **Installation raccordée** (grid-connected PV / STEG net-metering)
   - **Pompage solaire** (solar water pumping)
   - **Site isolé** (off-grid / autonomous systems)
   - **BT** (basse tension — low-voltage electrical work)
   - **MT** (moyenne tension — medium-voltage electrical work)
2. Generate qualified leads through a structured **devis request** flow tuned to each activity.
3. Be fully usable in **Arabic (RTL), French, and English**.
4. Let the team edit all content (pages, services, projects, team, FAQ) **without touching code**.
5. Score well on **SEO, performance, and accessibility** (mobile-first; most Tunisian traffic is mobile).

Non-goals for v1: e-commerce, client portal, production monitoring. These are stubbed as "Coming soon" and planned in the roadmap (Phase 8).

---

## 2. Tech stack & key decisions

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router, TypeScript)** | SSR/SSG for SEO, i18n routing, server actions for the devis form |
| Styling | **Tailwind CSS** + CSS logical properties | Fast, consistent; logical props (`ps-`, `pe-`, `ms-`, `me-`) make RTL nearly free |
| UI primitives | **shadcn/ui** (Radix under the hood) | Accessible components, easy to theme, dark/light |
| Animations | **Framer Motion** | Section reveals, transitions, loading feedback (your UI standard) |
| i18n | **next-intl** | Locale routing (`/ar`, `/fr`, `/en`), message catalogs, RTL awareness |
| CMS | **Payload 3** (embedded in the Next.js app) | Self-hosted, Postgres-backed, native localization + RTL, built-in admin & auth |
| Database | **PostgreSQL** | Your stack; Payload's `@payloadcms/db-postgres` adapter |
| Media | Local disk (v1) → S3-compatible later | Simplicity now; upgrade path for scale |
| Forms/validation | **Zod** + React Hook Form | Type-safe devis validation shared client/server |
| Email | **Nodemailer** over SMTP | Devis notifications to the team + auto-reply to the client |
| Optional notify | **Telegram bot** (`@Slah_Smichi`) | Instant lead ping; you already use Telegram |
| Deployment | **VPS + Docker Compose** (app + Postgres) | Payload needs a Node server + DB + media dir; VPS keeps data in-country |
| Analytics | **Plausible** (self-hosted or cloud) or GA4 | Privacy-friendly; lightweight |

**If you (Slah) later prefer Sanity instead of Payload:** content would live in Sanity's hosted dataset (monthly cost, external), the admin would be Sanity Studio (separate app), and the Next.js app would fetch via GROQ. Everything else in this plan stays the same. Payload is the assumed default below.

**Deployment note:** VPS is assumed because Payload runs a persistent Node server and owns the Postgres connection and media folder. Vercel is possible but then Postgres must be external (e.g. Neon/Supabase) and media must go to S3/R2 from day one — more moving parts. Decide before Phase 7.

---

## 3. Information architecture (sitemap)

All routes are locale-prefixed: `/{locale}/...` with `locale ∈ {ar, fr, en}`.

```
/                         Home (hero, 5 activities, proof, CTA devis)
/services                 Services overview (the 5 activities as cards)
/services/[slug]          Activity detail:
                            - installation-raccordee
                            - pompage-solaire
                            - site-isole
                            - basse-tension
                            - moyenne-tension
/projects                 Realized projects (filterable by activity/region)
/projects/[slug]          Project case study (gallery, specs, client type)
/about                    Company, ANME certification, values, timeline
/team                     Team (optional; Coming soon if no content)
/faq                      FAQ (subsidies, STEG process, warranty…)
/contact                  Contact (map Sbeitla, phone, email, form)
/devis                    Multi-step quote request (the conversion engine)
/blog                     Blog/actualités (Phase 8 — Coming soon stub in v1)
/blog/[slug]              Article
/mentions-legales         Legal (FR)
/politique-confidentialite Privacy (FR)
/admin                    Payload CMS admin (auth-protected)
```

Global elements: sticky header with language switcher (AR/FR/EN) + prominent **"Demander un devis"** CTA; footer with matricule fiscal, address (Rue Marroc, Sbeitla 1250), contacts, socials, quick links.

---

## 4. Data model (Payload collections)

All text fields marked `localized: true` so AR/FR/EN are stored per-locale. Slugs are shared across locales (or per-locale if SEO demands — default to shared).

1. **Services** — the five activities.
   - `title` (localized), `slug`, `activityKey` (enum: `raccorde|pompage|isole|bt|mt`), `shortDescription` (localized), `body` (localized rich text), `icon`, `heroImage`, `benefits[]` (localized), `process[]` (step title + desc, localized), `faqRefs[]` (relation → FAQ), `seo` group, `order`.
2. **Projects** — case studies.
   - `title` (localized), `slug`, `activity` (relation → Services), `region`, `clientType` (enum: `residentiel|agricole|industriel|public/B2G`), `powerKwc` (number), `summary` (localized), `body` (localized), `gallery[]` (media), `coverImage`, `date`, `featured` (bool), `seo`.
3. **Pages** — flexible marketing pages (Home, About) via a **blocks** field (Hero, Stats, ActivityGrid, ProjectsCarousel, CTA, RichText, Logos, FAQ). All block text localized.
4. **FAQ** — `question` (localized), `answer` (localized), `category`, `order`.
5. **Team** — `name`, `role` (localized), `photo`, `order` (optional; hide section if empty).
6. **DevisRequests** — captured leads (see §6). Read-only-ish admin list with status workflow.
7. **Media** — uploads with `alt` (localized).
8. **Globals:** `SiteSettings` (contacts, address, matricule fiscal, socials, map coords), `Navigation`, `Footer`.
9. **Users** — CMS/admin auth (Payload built-in). Roles: `admin`, `editor`.

---

## 5. Internationalization & RTL

1. Locales: `ar` (default region audience), `fr`, `en`. Choose default landing locale = `fr` (or geo/Accept-Language detection → fallback `fr`).
2. next-intl message catalogs for **UI chrome** (buttons, labels, form text): `messages/ar.json`, `fr.json`, `en.json`. **CMS content** comes localized from Payload.
3. RTL: set `dir="rtl"` on `<html>` when `locale === 'ar'`. Use Tailwind **logical utilities** (`ps/pe/ms/me/start/end`, `text-start`) everywhere — avoid hard `left/right`. Mirror icons/carousels for RTL.
4. Fonts: an Arabic-capable webfont (e.g. **IBM Plex Sans Arabic** / **Cairo**) + a Latin font (e.g. **Inter**). Load per-locale to avoid shipping both.
5. Number/date formatting via `Intl` per locale. Keep **TVA 19%** and **Timbre Fiscal** wording correct in FR contexts.
6. Language switcher preserves the current path and swaps only the locale segment.

---

## 6. Devis (quote request) system — the conversion engine

**Flow:** multi-step, animated, with a progress indicator ("Étape 2/4"), tooltips, and inline validation. Fields adapt to the chosen activity.

**Step 1 — Activity:** pick one of the five (cards with icons).
**Step 2 — Technical needs (conditional per activity):**
- *Installation raccordée:* monthly STEG bill (TND) or consumption (kWh), roof type/surface, single/tri-phase, property type.
- *Pompage:* water source (well/forage/surface), depth (m), flow needed (m³/day or m³/h), head/HMT (m), existing pump (CV) if any.
- *Site isolé:* daily consumption (kWh/day), critical loads, autonomy days, existing genset (Y/N).
- *BT / MT:* nature of work, site type, indicative power, existing installation notes.
**Step 3 — Site & contact:** name, phone (TN format validation), email (optional), region/governorate, address, preferred contact channel (call/WhatsApp/Telegram).
**Step 4 — Review & submit:** summary + consent checkbox (privacy). Submit via **server action**.

**On submit:**
1. Validate with a shared **Zod** schema (client + server).
2. Persist to **DevisRequests** (status = `nouveau`).
3. Email the team (SMTP) with a formatted summary; send the client an FR auto-reply acknowledging receipt.
4. Optional: fire a **Telegram** message to the team chat.
5. Show an animated success state with a reference number; handle/error states gracefully.
6. Anti-spam: honeypot field + basic rate limiting; optional hCaptcha if abuse appears.

**Admin side:** DevisRequests list in Payload with columns (date, activity, region, status), a status field (`nouveau → contacté → devis envoyé → gagné/perdu`), and internal notes. This is the light lead-management layer inside the full CMS.

---

## 7. Design system & UI standards

- Brand: use Growing Technologies identity (green/solar palette from the brand assets). Define Tailwind theme tokens (`primary`, `accent`, `surface`, semantic colors) for **light + dark**.
- Components (shadcn/ui): Button, Card, Input, Select, Tabs, Accordion (FAQ), Dialog, Toast, Badge, Progress (devis steps), Tooltip.
- Motion: section reveal-on-scroll, hover elevation on cards, page/step transitions, skeleton loaders and button spinners for all async actions (loading feedback is required, never a frozen click).
- Tooltips for technical form fields (e.g. explain HMT, kWc, autonomie).
- Never plain/generic layouts: use a strong hero, iconography per activity, stats band (installations, kWc installed, régions couvertes), and project imagery.
- Accessibility: WCAG AA contrast, focus states, keyboard nav, `alt` text (localized), reduced-motion support.

---

## 8. Phased build roadmap

> Build in this order. Each phase ends with an acceptance checklist.

### Phase 0 — Repo & tooling
1. `create-next-app` (TS, App Router, Tailwind, ESLint).
2. Add Prettier, Husky + lint-staged, `.editorconfig`, absolute imports.
3. Set up shadcn/ui, Framer Motion, next-intl, Zod, React Hook Form.
4. `.env.example` with all vars (§9). Commit initial structure.
- **Accept:** app boots, lint/format pass, base layout renders.

### Phase 1 — Payload CMS + database
1. Integrate Payload 3 into the app; Postgres adapter; connect to DB.
2. Define collections & globals (§4) with localization enabled (ar/fr/en).
3. Seed script: 5 Services, sample Projects, FAQ, SiteSettings, one admin user.
4. `/admin` reachable and auth-protected.
- **Accept:** admin login works; all collections CRUD in three locales; seed data present.

### Phase 2 — i18n foundation & layout
1. next-intl locale routing (`/ar|fr|en`), middleware, locale detection → fallback `fr`.
2. Root layout sets `lang`/`dir`; per-locale fonts.
3. Global Header (nav + language switcher + devis CTA) and Footer (fed by Globals).
4. Message catalogs for UI chrome.
- **Accept:** switching locale swaps content + direction; Arabic renders RTL correctly; nav/footer pull from CMS.

### Phase 3 — Core marketing pages
1. Home (block-driven: hero, activity grid, stats, featured projects, CTA).
2. Services overview + the five `/services/[slug]` detail pages from CMS.
3. About (ANME certification, company story, matricule fiscal).
4. Contact (form-lite + map of Sbeitla + coordinates from SiteSettings).
- **Accept:** all pages render from CMS in 3 locales; responsive mobile→desktop; no hardcoded copy.

### Phase 4 — Projects
1. Projects listing with filters (activity, region, clientType).
2. Project case-study pages (gallery, specs, kWc, client type).
- **Accept:** filtering works; galleries responsive; SEO metadata per project.

### Phase 5 — Devis system
1. Multi-step form UI with progress indicator + tooltips + validation (§6).
2. Zod schemas (shared), server action, DevisRequests persistence.
3. Email (team + client auto-reply FR) and optional Telegram notify.
4. Admin lead workflow (status + notes). Anti-spam.
- **Accept:** end-to-end submission stores a lead, sends both emails, shows success state; validation blocks bad input; admin can move status.

### Phase 6 — FAQ, legal, polish
1. FAQ (accordion, categories) from CMS.
2. `mentions-legales` + `politique-confidentialite` (FR) from CMS.
3. Dark mode, animations pass, empty/loading/error states, "Coming soon" stubs (blog, team if empty, future portal).
- **Accept:** legal pages present; dark mode consistent; no dead links.

### Phase 7 — SEO, performance, deploy
1. Metadata API (title/description/OG per page & locale), `hreflang` alternates, sitemap.xml, robots.txt, JSON-LD (`LocalBusiness`, `Service`).
2. Image optimization (`next/image`), font strategy, Lighthouse pass (target ≥90 perf/SEO/a11y on mobile).
3. Dockerfile + docker-compose (app + Postgres + media volume); env for prod; HTTPS via reverse proxy (Caddy/Nginx); backups for Postgres + media.
4. Analytics (Plausible/GA4).
- **Accept:** deployed on VPS over HTTPS; Lighthouse targets met; sitemap/hreflang valid; DB & media backup documented.

### Phase 8 — Roadmap (post-v1, stubbed now)
- Blog/actualités; Team; client portal (project tracking, docs: devis/factures/contrats/attestations); production monitoring; equipment catalog / e-commerce (TVA 19% + Timbre Fiscal). Each currently a "Coming soon" placeholder.

---

## 9. Repository structure

```
growing-tech-web/
├─ src/
│  ├─ app/
│  │  ├─ (frontend)/[locale]/        # localized public routes
│  │  │  ├─ page.tsx  services/  projects/  about/  contact/  devis/  faq/  ...
│  │  ├─ (payload)/admin/            # Payload admin
│  │  └─ api/                        # route handlers (webhooks, telegram)
│  ├─ blocks/                        # Home/Page block renderers
│  ├─ collections/                   # Payload collections
│  ├─ globals/                       # Payload globals
│  ├─ components/  ui/ (shadcn)  sections/  forms/
│  ├─ lib/  (payload client, email, telegram, zod schemas, utils)
│  ├─ i18n/  messages/{ar,fr,en}.json
│  └─ styles/
├─ payload.config.ts
├─ docker-compose.yml   Dockerfile   .env.example
└─ scripts/seed.ts
```

---

## 10. Environment variables (`.env.example`)

```
DATABASE_URI=postgres://user:pass@localhost:5432/growingtech
PAYLOAD_SECRET=change-me
NEXT_PUBLIC_SITE_URL=https://growing-technologies.tn
DEFAULT_LOCALE=fr
SMTP_HOST=  SMTP_PORT=  SMTP_USER=  SMTP_PASS=  MAIL_FROM=
DEVIS_NOTIFY_EMAIL=slahchmissi@gmail.com
TELEGRAM_BOT_TOKEN=   TELEGRAM_CHAT_ID=        # optional
PLAUSIBLE_DOMAIN=                              # optional
```

---

## 11. Cross-cutting requirements

- **Security:** validate/sanitize all input, CSRF-safe server actions, rate-limit devis, secure admin (strong password, HTTPS only), least-privilege DB user, no secrets in client bundle.
- **Performance:** SSG/ISR for marketing pages, lazy-load galleries, optimize images, minimal client JS.
- **Accessibility:** WCAG AA, keyboard + screen-reader friendly, localized `alt`, reduced motion.
- **Content integrity:** all copy from CMS; no English-only fallbacks leaking into AR/FR; FR legal text correct for Tunisia (matricule fiscal, TVA 19%).
- **Testing/verification:** typecheck + lint clean; Playwright smoke tests for the devis flow and locale switching; manual Lighthouse + RTL visual check on Arabic.

---

## 12. Definition of done (v1)

1. Deployed, HTTPS, on VPS with Postgres + media backups.
2. Home, Services (+5 details), Projects (+details), About, Contact, FAQ, Devis, Legal — all live in **AR/FR/EN**, RTL correct in Arabic.
3. Devis flow works end-to-end (store + emails + optional Telegram); admin can manage leads.
4. Team can edit all content in Payload without code changes.
5. Lighthouse mobile ≥90 (Perf/SEO/A11y); valid sitemap + hreflang + JSON-LD.
6. "Coming soon" stubs in place for Phase 8 features; no broken links.
```
