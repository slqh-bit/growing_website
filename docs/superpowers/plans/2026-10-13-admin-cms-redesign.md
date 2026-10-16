# Admin CMS redesign implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reshape the Payload admin into per-company workspaces with a 7-entry sidebar, shorter forms, a quote-request inbox and a task-oriented home screen.

**Architecture:** Pure decision logic (which workspace, which nav entries, which request status comes next, which page sections are allowed) lives in dependency-free modules under `src/cms/` and is unit tested. Payload config wires those modules in (`baseFilter`, field defaults, tab regrouping, field access). The screens are server components under `src/components/admin/` that read through the Local API with the user's own access, with small client components for the three interactive parts.

**Tech stack:** Payload 3.90.2, Next.js 15.4, React 19, lucide-react, node:test.

**Spec:** `docs/superpowers/specs/2026-10-13-admin-cms-redesign-design.md`

## Global constraints

- No database schema change: tabs stay unnamed, no field is renamed, added or removed.
- Access rules in `src/cms/access.ts` remain the security boundary; the workspace filter never grants anything.
- Every new label exists in French, English and Arabic.
- New CSS uses logical properties (`inline-start`, `margin-inline`) so Arabic mirrors.
- Public sites and their tests are untouched.

## Facts verified against Payload 3.90.2

- `admin.baseFilter` applies to the admin List view and Lexical internal links only, never to the public API.
- Tabs accept `admin.condition`, and conditions receive `user`.
- The `blocks` field accepts `filterOptions`; a present-but-disallowed block fails validation on save.
- `admin.components.Nav`, `views.dashboard` and a collection's `views.list.Component` are replaceable; `NavWrapper` and `NavHamburger` are exported from `@payloadcms/next/client`.
- `tests/e2e` never opens the admin, so no existing spec depends on the old navigation.

## Review focus

1. A workspace cookie naming a site the user may not manage: must fall back to their first site, never filter by the forbidden one.
2. An editor creating a document while the Site field is hidden: the document must land in the workspace and pass `create` access.
3. An existing company page that already uses a group-only section: must stay saveable.
4. An editor PATCHing an administrator-only Sites field through the API: the value must not change.
5. "Quote sent" without a PDF from the inbox: the refusal message must reach the screen.

## File map

| File | Responsibility |
|---|---|
| `src/cms/workspace.ts` (new) | Cookie parsing, workspace choice, list filter. Pure. |
| `src/cms/workspace-server.ts` (new) | Resolve the workspace for a Payload request (reads sites once per request). |
| `src/cms/nav.ts` (new) | Sidebar entries per role. Pure. |
| `src/lib/devis/inbox.ts` (new) | Inbox tabs, next status, contact links. Pure. |
| `src/blocks/allowed.ts` (new) | Which page sections a site may add. Pure. |
| `src/cms/fields.ts`, `src/cms/access.ts` | Site field default and visibility; site-manager access. |
| `src/collections/*.ts` | `baseFilter`, tab regrouping, inbox list view. |
| `src/components/admin/nav/` (new) | Sidebar, switcher. |
| `src/components/admin/inbox/` (new) | Inbox screen and its actions. |
| `src/components/admin/home/` (new) | Home screen. |
| `src/app/(payload)/custom.scss` | Styles for the above. |
| `tests/unit/admin-*.test.ts` (new) | Unit tests for the pure modules. |

---

### Task 1: Workspace logic

**Files:** create `src/cms/workspace.ts`, `src/cms/workspace-server.ts`, `tests/unit/admin-workspace.test.ts`.

**Produces:**
- `WORKSPACE_COOKIE = "admin-site"`
- `readCookie(header: string | null | undefined, name: string): string | null`
- `pickWorkspace(requested: string | null, allowed: readonly Id[]): Id | null`
- `workspaceWhere(field: "site" | "sites", id: Id | null): Where | null`
- `resolveWorkspace(req): Promise<{ current: WorkspaceSite | null; sites: WorkspaceSite[] }>` with `WorkspaceSite = { id, key, name, monogram, color, logoUrl }`
- `workspaceFilter(field): BaseFilter`

- [ ] Write tests: cookie parsing (present, absent, among others, URL-encoded), `pickWorkspace` (allowed, forbidden falls back to first, empty list gives null, numeric id matched against string cookie), `workspaceWhere` (`site` gives `equals`, `sites` gives `in`, null gives null).
- [ ] Run `npm test`, see them fail.
- [ ] Implement; run `npm test`, see them pass.

### Task 2: Workspace applied to lists and forms

**Files:** modify `src/cms/fields.ts`, `src/cms/access.ts`, and the collections `Pages`, `Services`, `Projects`, `Faq`, `Team`, `DevisRequests`, `DevisForms`, `DevisAttachments`, `CompanyDocuments` (`site`), `Partners`, `Redirects` (`sites`).

- [ ] `siteField()`: `defaultValue` resolves the workspace from `req`; `admin.condition` shows it to administrators only.
- [ ] `siteContentAccess().create`: when no site is submitted, allow (the default fills in an allowed site) instead of refusing.
- [ ] Add `admin.baseFilter: workspaceFilter(<field>)` to each listed collection.
- [ ] `npm run typecheck`.

### Task 3: Sidebar

**Files:** create `src/cms/nav.ts`, `tests/unit/admin-nav.test.ts`, `src/components/admin/nav/index.tsx`, `nav-links.tsx`, `workspace-switcher.tsx`; modify `src/payload.config.ts`, `custom.scss`.

**Produces:** `navEntries({ isAdmin, siteId }): NavEntry[]` with `NavEntry = { key, href, icon, label: Label, badge?: "newRequests", children?: NavChild[] }`.

- [ ] Tests: staff get exactly `home, requests, pages, services, projects, library, company`; administrators get those plus `settings`; `company` points at `/admin/collections/sites/<siteId>` and is omitted when there is no workspace; `library` holds faq, team, partners, media, company-documents; `requests` has a `forms` child.
- [ ] Implement `nav.ts`, then the components (server `AdminNav` counts new requests with the user's access; client `NavLinks` marks the active entry; client `WorkspaceSwitcher` writes the cookie and reloads `/admin`).
- [ ] Register `admin.components.Nav`; regenerate the import map.

### Task 4: Shorter forms

**Files:** modify `src/collections/Sites.ts`, `Services.ts`, `Projects.ts`, `Pages.ts`, `src/cms/access.ts`; create `src/blocks/allowed.ts`, `tests/unit/admin-blocks.test.ts`.

**Produces:** `allowedBlockSlugs({ siteKey, used }): string[]`; `siteManagers: Access`.

- [ ] Tests for `allowedBlockSlugs`: a company site gets the common sections only; the group site gets all; a group-only section already used on a company page stays allowed.
- [ ] Sites: tabs become Contact, Brand, Menu, Footer, Key figures, Advanced; Advanced has `admin.condition` (administrators) and each of its fields `access.update: adminsFieldLevel`; collection `update` becomes `siteManagers`.
- [ ] Services and Projects: main fields grouped into "Essentials" and "More options" unnamed tabs; sidebar fields stay top level.
- [ ] Pages: `layout.filterOptions` from `allowedBlockSlugs`.
- [ ] `npm run typecheck`, `npm test`.

### Task 5: Requests inbox

**Files:** create `src/lib/devis/inbox.ts`, `tests/unit/admin-inbox.test.ts`, `src/components/admin/inbox/index.tsx`, `request-detail.tsx`, `status-actions.tsx`, `quote-drop.tsx`; modify `src/collections/DevisRequests.ts`.

**Produces:** `inboxTabs`, `tabStatuses(tab)`, `tabOf(status)`, `nextStatus(status)`, `contactLinks({ phone, email })`.

- [ ] Tests: tab membership for all five statuses; `nextStatus` walks nouveau, contacte, devis-envoye, gagne and returns null after gagne and perdu; `contactLinks` builds `tel:`, `https://wa.me/216…` and `mailto:` and omits email when absent.
- [ ] Implement; register `admin.components.views.list.Component`.
- [ ] Status and quote changes go through `/api/devis-requests/:id`; a refusal's message is shown beside the action.

### Task 6: Home

**Files:** create `src/components/admin/home/index.tsx`; modify `src/payload.config.ts` (replace `beforeDashboard` with `views.dashboard`); delete `src/components/admin/document-expiry.tsx` once its query has moved.

- [ ] Counters (new requests, awaiting quote, documents expiring), "Waiting for you" list, two shortcuts, empty state.

### Task 7: Verification

- [ ] `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- [ ] With a database: sign in as administrator and as a one-company editor, walk the five Review focus cases, check Arabic.
