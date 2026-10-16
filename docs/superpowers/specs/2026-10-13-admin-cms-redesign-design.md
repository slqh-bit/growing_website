# Admin CMS redesign — design

Date: 2026-10-13
Status: awaiting review

## Why

The admin is the stock Payload panel: 15 collections and one global in 6 sidebar
groups, a 50-field Sites form, content from three sites mixed in every list, and
quote requests spread over four menu entries. The people who use it are separate
teams per company (Growing staff, Hikview staff) plus one administrator. They
find it complicated on four counts, all confirmed by the owner:

1. Too many menu entries.
2. Forms are too long.
3. Multi-site is confusing.
4. Following up on quote requests takes too many clicks.

## Goal

A staff member opens the admin, lands in their own company, sees what needs
doing, and can do the daily jobs (answer a quote request, edit a page, add a
project, update a phone number) without meeting anything technical or anything
belonging to another company.

Success looks like:

- An editor assigned to one company never sees another company's content, a
  "Site" field, or a technical setting.
- The sidebar has 7 entries for staff, 8 for the administrator.
- A new quote request can be read, called back, moved to the next status and
  given its quote PDF from one screen.
- Nothing about the public sites, the database content or the existing URLs of
  admin records changes.

## Decisions already taken

- Keep Payload 3 and all data; reshape the admin rather than replace it.
- Company staff can edit their own quote forms.
- Company documents stay inside Library.
- Visual direction: minimal, compact spacing, almost no motion (from the
  UI/UX Pro Max recommendation). Its dark palette and Fira fonts are not used:
  the admin keeps a light default with Payload's dark mode, the fonts the sites
  already ship (IBM Plex Sans Arabic for Arabic), and each workspace is tinted
  with that company's brand colour.

## Design

### 1. Company workspace

The admin always works inside one company ("workspace"): Growing, Hikview or
Group.

- **Switcher** at the top of the sidebar: logo or initials, company name, and a
  menu of the companies the user may manage. Users with a single company see the
  name without a menu.
- **Who sees what** follows the existing rule in `src/cms/access.ts`
  (`managedSiteIds`): administrators and editors with no assigned sites get all
  companies; other editors get their assigned ones.
- **Remembering the choice**: the selected site id is kept in a cookie so the
  server can read it on every request. A value the user is not allowed to manage
  is ignored and replaced by their first allowed company.
- **Effect on lists**: every per-site collection gets a `baseFilter` limiting it
  to the workspace. Collections linked to several sites (Partners, Redirects)
  match when the workspace is among their sites. Media and Users are shared and
  not filtered.
- **Effect on forms**: the "Site" field defaults to the workspace and is shown
  only to administrators. Relationship pickers already filter by the document's
  site and keep doing so.
- **Accent colour**: the workspace's `theme.primary` drives the admin accent
  (active sidebar item, primary button), with the current default when empty.

The access rules stay the security boundary. The workspace filter is a
convenience on top of them and never grants anything.

### 2. Sidebar

A custom navigation component replaces Payload's default.

| Entry | Contains | Who |
|---|---|---|
| Home | New home screen (section 5) | everyone |
| Requests | Quote inbox (section 4), with a count of new requests; a secondary "Forms" link opens the quote forms | everyone |
| Pages | Pages | everyone |
| Services | Services | everyone |
| Projects | Projects | everyone |
| Library | FAQ, Team, Partners, Media, Company documents | everyone |
| My company | Everyday settings of the workspace's site (section 3) | everyone |
| Settings | Sites and domains, Redirects, Users, Group | administrators |

Settings is separated from the rest by a divider. Quote documents and quote
attachments are no longer menu entries; their files are reached from the request
they belong to. Their collections stay, hidden from navigation.

Labels exist in French, English and Arabic like the rest of the admin, and the
layout uses logical CSS properties so it mirrors correctly in Arabic.

### 3. Shorter forms

**My company** opens the workspace's Sites document directly, without a list.
It keeps five tabs:

- Contact: email, phone, WhatsApp, Telegram, address, city, hours, map
  coordinates, social links.
- Brand: logo, dark logo, initials, logo second line, share image, favicon,
  colours.
- Menu: header links.
- Footer: tagline, quick links, legal links.
- Key figures: the home stats.

Everything else moves to an **Advanced** area visible to administrators only:
site key, default-site flag, public address, domains, trade and legal names, tax
id, RNE, certification, business type, quote notification routing. The slogan and
the services-page introduction join the Brand tab, since staff do edit them.

**Services** and **Projects** get two tabs: "Essentials" (title, short
description, main image, body) and "More options" (everything else, including
SEO). The tabs are unnamed, so the stored data keeps its shape and no migration
is needed.

**Pages**: section types that only make sense on the group site (group hero,
companies, group services, steps, group projects, quote form) are offered only
when the page belongs to the group site, using the blocks field's
`filterOptions`. Existing pages are unaffected because no page currently mixes
the two sets; the plan must confirm this against the seeded and live content
before enabling the filter, since a section that is no longer allowed blocks
saving.

**Permission change (needs your confirmation).** Today only administrators can
change a Sites document. For "My company" to be useful to staff, editors gain
the right to update the everyday tabs of the sites they manage. The Advanced
fields stay administrator-only through field-level access, so an editor cannot
change them even through the API. This is the one change to who-can-do-what in
this design.

### 4. Requests inbox

Replaces the list view of quote requests with a two-pane screen.

- **Left**: requests of the workspace, newest first, filtered by three groups:
  New (`nouveau`), In progress (`contacte`, `devis-envoye`), Done (`gagne`,
  `perdu`). Search by reference, name, phone or email, as today.
- **Right**: the selected request.
  - Header: name, reference, service, and Call / WhatsApp / Email buttons built
    from the request's contact details.
  - Status as a step bar (New, Contacted, Quote sent, Won) with one button for
    the next step and a "Mark as lost" action kept apart from it.
  - The customer's answers, rendered the way the existing
    `devis-answers` component does.
  - Their attached files as download links.
  - A drop zone for the quote PDF. It uploads to the existing quote-documents
    collection and links it to the request.
  - "Open full record" leads to the existing edit view for anything rare.
- **New request by hand**: a button opens the existing create form (phone and
  walk-in leads).

All changes go through Payload's API, so the existing rules keep applying
unchanged: a quote PDF is required before "Quote sent", status dates are
recorded for the customer tracking page, and the customer is emailed at
"Quote sent" and "Won". A refused change shows its message next to the action
that caused it.

The selected request is part of the URL, so a request can be linked to and the
browser's back button behaves.

### 5. Home

Replaces the dashboard's grid of collection cards, for the current workspace:

- Three counters: new requests, requests waiting for a quote (`contacte`),
  company documents expiring soon.
- "Waiting for you": the latest new requests and the expiring documents, each
  opening the relevant record. The expiring-documents rule is the one the
  existing `document-expiry` component already implements; it moves here.
- Two shortcuts: add a project, log a request by hand.
- When nothing is waiting, a short message says so and offers the shortcuts.

### Structure in the code

| Unit | Responsibility |
|---|---|
| `src/cms/workspace.ts` | Resolve the current workspace from the request and the user; build the list filter. Pure functions, unit tested. |
| `src/cms/fields.ts` (`siteField`) | Default to the workspace; visible to administrators only. |
| `src/components/admin/nav/` | Sidebar and company switcher. |
| `src/components/admin/home/` | Home screen. |
| `src/components/admin/inbox/` | Requests inbox (list pane, detail pane, status bar, quote drop zone). |
| `src/collections/*.ts` | `baseFilter`, tab regrouping, navigation visibility. |
| `src/collections/Sites.ts` | Tab regrouping, editor update access, field-level access on Advanced fields. |
| `src/app/(payload)/custom.scss` | Admin spacing, type and accent tokens. |

Each admin component reads data through Payload's Local API on the server and
receives plain props; the interactive parts (switcher menu, status change, file
drop) are small client components.

## Out of scope

- Replacing Payload or changing the database schema.
- The public sites.
- New roles beyond administrator and editor.
- Changing what a quote form can ask, or the quote workflow's statuses and
  emails.
- A mobile-first admin. The layout must stay usable on a tablet; phones get
  Payload's existing responsive behaviour for forms and a single-pane inbox.

## Build order

Each step is usable on its own and can be released separately.

1. Workspace and sidebar (sections 1 and 2).
2. Shorter forms (section 3).
3. Requests inbox (section 4).
4. Home (section 5).

## Testing

- **Unit**: workspace resolution (allowed, not allowed, missing cookie, single
  company), list filter per collection kind, sidebar entries per role.
- **End to end (Playwright)**, with one editor per company and one
  administrator:
  - an editor sees only their company's records and no switcher menu;
  - the administrator switches company and lists change accordingly;
  - an editor updates the phone number in My company and cannot change a domain,
    including through the API;
  - a request goes from New to Contacted to Quote sent, and "Quote sent" is
    refused without a PDF;
  - Home counters match the seeded data.
- The existing 91 end-to-end tests and the unit suite keep passing; the two
  specs that already open the admin (`tests/e2e/devis.spec.ts`,
  `tests/e2e/site.spec.ts`) are updated where they rely on the old navigation.
- Manual check of the admin in Arabic for mirrored layout.

## To verify during planning

- That tabs can be hidden per role in Payload 3.90.2; if not, the Advanced
  fields are hidden individually with the same result.
- That no existing page uses a section type the new filter would disallow.
- The cleanest way to open "My company" straight on the workspace's document.
