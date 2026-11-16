# Jadeite Systems · Director portal (Figma Make)

Clickable prototype of the **Director** portal for Jadeite Glazing (windows, doors, bifolds, orangeries) — business-wide visibility, reporting and authorised overrides on the same platform as the Office Admin, Sales, Surveyor, Installer, Customer and System Admin portals.
React 19 + Vite + TypeScript, running inside Figma Make. Same design system and layout as the client-approved Office Admin (Figma node 25:2) — keep it.

The demo is signed in as **James Whitfield** (Director). Demo "today" is Friday 16 Oct 2026. Scope follows the BRD: 6 Roles (Director: business-wide visibility, reporting, authorised overrides), 4.1.15 Dashboards and Reporting (agreed definitions, drill down), Exception Management (overdue, blocked, incomplete, unscheduled), 4.1.10 installation overrides with a reason and audit entry, 4.1.16 audit trail.

## Development server
A Vite dev server is already running on `$PORT` (default 8443). Changes hot-reload in the preview.

## Structure
- `src/main.tsx` – entry: HashRouter → StoreProvider → ToastProvider → App. Imports Sora font, `src/index.css`, `src/styles/app.css`.
- `src/App.tsx` – routes: login (password + two-step code, forgot password, locked), welcome tour (3 steps), Dashboard, Sales pipeline, Projects (+ project page), Installation diary, Deliveries, Needs attention, Approvals, Reports (Sales, Jobs and diary, Money, Team), Team, Audit history, My settings.
- `src/components/Layout.tsx` – Director sidebar, header (⌘K search of projects, enquiries and pages; notifications; profile menu), footer.
- `src/components/director.tsx` – exceptions (what needs attention), approve / decline and what each approval changes, "Ask for an update", private director notes, "How is this counted?" definitions.
- `src/components/ui.tsx`, `src/components/charts.tsx` – shared UI and simple SVG charts.
- `src/data/biz.ts` – the same enquiries, staff and sales figures as the Office Admin; `src/data/director.ts` – projects, approvals, diary, finance, team workload, metric definitions, audit; `src/data/store.tsx` – demo state, `log()` (audit), `ask()` and `note()` (saved in sessionStorage; "Reset demo data" in the profile menu clears it).
- `public/images` – property photos and the Jadeite J logo (use relative paths like `images/house.jpg`).

## Director flows
- **Dashboard:** open pipeline, won this month, win rate, still to collect (each with its agreed definition and a link to the records), quoted vs won chart, decisions waiting (approve / decline in place), needs attention by type, fitter workload, deliveries due and late, pipeline by stage, visits coming up, connection health, latest changes.
- **Sales pipeline:** Kanban by BRD stages, filter by salesperson, open a card → details, ask the salesperson for an update, private note, change salesperson (authorised override, reason required, audited).
- **Projects:** every won job with owner, next action, due date, flags, money paid; project page with stage, next action, order/delivery, fitting, snags, invoices from Xero, timeline, updates asked, private notes, decisions and changes; export.
- **Installation diary:** week view by fitter (previous / next week), ready-but-not-booked queue, pending clash/override requests (the office books; the Director approves exceptions).
- **Deliveries:** due, late and arrived supplier orders from the office’s order dates; ask for an update.
- **Needs attention:** overdue, blocked, incomplete, not booked, late deliveries, open snags, sync errors — owner, next action, due, days late; ask for an update; open the record.
- **Approvals:** installation overrides, diary clashes, salesperson changes, data import approval, permission changes → approve (optional note) or decline (reason); the change is applied (e.g. the fitting appears in the diary) and saved in the audit history.
- **Reports:** Sales, Jobs and diary, Money (from Xero), Team; period; definitions; drill down; export CSV; print.
- **Team:** workload, next job and status for everyone; send a message. **Audit history:** search, filter, before/after, export. **My settings:** details, sign-in, what to be told about.

## Design system (do not drift)
- Font: Sora (400–700). Plain CSS tokens in `src/styles/app.css` — reuse its classes (`card`, `tag`, `btn`, `input`, `list`, `grid-2`, `hstack`, `vstack`, `between`, `muted`…).
- Colours: primary `#00c7a1`, primary-dark `#0b6e5c`, deep `#0b1f1b`, tint `#ebf7f3`, page `#f6f8f7`, border `#e3e9e7`, text `#0f1414` / `#3a4a4a` / `#6b7a78`, ok `#1f9d5b`, warn `#e0a100`, error `#d64545` (use red sparingly).
- Calm, simple, jargon-free wording (main users are 60+). Real property photos where they help.
- Tailwind utilities are available, but Tailwind's base reset is intentionally not loaded.

## Demo sign-in
Any email and password · security code **482193** (3 wrong codes locks the account).

## Code quality
- Use double quotes for strings containing apostrophes, or escape them.
- Keep JSX balanced; pages export components used in `App.tsx`.
