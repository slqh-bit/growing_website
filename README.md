# Growing Technologies — Website

Trilingual (Arabic / French / English, RTL-aware) marketing website for
**Growing Technologies**, an ANME-certified solar installer based in Sbeitla,
Tunisia. Built per [`growing-technologies-website-devplan.md`](./growing-technologies-website-devplan.md).

## Stack

| Concern      | Choice                                           |
| ------------ | ------------------------------------------------ |
| Framework    | Next.js 15 (App Router, TypeScript)              |
| Styling      | Tailwind CSS v4 + CSS logical properties (RTL)   |
| i18n         | next-intl (`/ar`, `/fr`, `/en`, default `fr`)    |
| Animations   | Framer Motion (reveal-on-scroll, transitions)    |
| Forms        | Zod + React Hook Form (devis engine, Phase 5)    |
| CMS          | Payload 3 + PostgreSQL (Phase 1 — not yet wired) |
| UI           | shadcn-style primitives (Radix-ready)            |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000  → redirects to /fr
```

Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `format`.

## Project status (phased roadmap)

- [x] **Phase 0** — Scaffold & tooling (Next.js, Tailwind v4, ESLint/Prettier,
      next-intl, Zod, RHF, Framer Motion, UI primitives).
- [x] **Phase 2** — i18n foundation & layout (locale routing, RTL, per-locale
      fonts, Header + language switcher + devis CTA, Footer).
- [x] **Phase 3** — Core marketing pages (Home, Services + 5 detail pages,
      Projects + filters + detail, About, Contact, FAQ, legal, devis preview).
- [ ] **Phase 1** — Payload CMS + PostgreSQL (content currently lives in typed
      modules under `src/content/` that mirror the planned Payload collections,
      so the CMS swap is a clean drop-in).
- [ ] **Phase 5** — Devis (multi-step quote) engine.
- [ ] **Phase 7** — SEO, performance, Docker deploy.

## Structure

```
src/
├─ app/[locale]/        Localized routes (home, services, projects, about, …)
├─ components/
│  ├─ ui/               Design-system primitives (button, card, accordion, …)
│  ├─ layout/           Header, footer, language switcher, theme toggle
│  ├─ sections/         Hero, stats, cards, CTA, page headers
│  └─ motion/           Reveal-on-scroll helpers (reduced-motion aware)
├─ content/             Typed content modules (mirror Payload collections)
├─ i18n/                Routing, navigation, request config
├─ styles/              Global tokens (light/dark, solar palette)
└─ middleware.ts        Locale detection & routing
messages/               UI-chrome catalogs: ar.json, fr.json, en.json
```

## Language rule

Code, comments and commits in English. All user-facing copy is AR/FR/EN.
Business/legal text (mentions légales, privacy) is authored in French.
