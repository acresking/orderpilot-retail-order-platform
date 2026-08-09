# OrderPilot — Retail Order Platform

A B2B ordering platform connecting distributors/suppliers with the retail chains and branches
they supply. Three parts share one codebase and one data model:

- **Branch app** (`/`) — a mobile-first PWA branches use to browse the catalog, place and track
  orders, and submit return/credit requests.
- **Company admin panel** (`/admin`) — order and packing workflow, catalog and stock management,
  promotions and banners, delivery scheduling, statistics, and ERP/data import.
- **Desktop app** — an Electron wrapper around the same admin panel for a native install on
  Windows/macOS/Linux, either running the server locally or pointing at a remote deployment.

This repository is also the **template** used by [`generator/`](generator) to produce fully
private, independent deployments for individual clients — see that folder's section below.

## Architecture

- **Server**: a dependency-free Node `http` server (`src/server/index.js`, entry point
  `server.js`) — no framework. RESTful JSON API, session-token auth, role/permission checks on
  every mutating endpoint, and file-based JSON storage per collection under `data/`.
- **Clients**: `src/client/mobile/app.js` and `src/client/admin/admin.js` are hand-written
  vanilla-JS single-file apps (no framework, no build tooling beyond string templating);
  `scripts/build-web.js` compiles them plus `src/client/shared/styles.css` into `public/`, which
  is what the server actually serves. Edit the `src/` files, not `public/` directly.
- **Shared config**: `src/shared/features.js` is the single source of truth for which optional
  capabilities exist, their prices, and which ones are on by default — read directly by the
  server and inlined into both client bundles at build time so all three always agree.

## Security

- All persisted data is encrypted at rest (AES-256-GCM) with a per-deployment key generated on
  first boot and stored in `.env` — never hardcoded, never shared between deployments.
- Passwords are hashed with scrypt (per-user random salt); access codes for networks/branches are
  stored as one-way hashes and cannot be redisplayed after creation, only reset.
- Every admin action is gated by an explicit permission check (`requirePerm`/`hasPerm`); optional
  features are gated server-side as well as hidden client-side, so a feature that isn't purchased
  is unreachable through the API, not just invisible in the UI.
- Standard security headers (CSP, `X-Content-Type-Options`, `X-Frame-Options`) are applied to
  every response.

## Getting started

```bash
npm install
npm start          # http://127.0.0.1:3000
```

- Branch app: `http://127.0.0.1:3000/`
- Admin panel: `http://127.0.0.1:3000/admin`
- Health check: `http://127.0.0.1:3000/api/health`

On first run, `data/` and a fresh `.env` (with a generated `DATA_ENCRYPTION_KEY` and
`CODE_PEPPER`) are created automatically. There is no seed data checked into this repository —
create a network, branch, and admin user through the panel, or run the generator described below
to produce a fully pre-seeded deployment.

Useful scripts (see `package.json` for the full list): `npm run build:web` rebuilds the client
bundles from `src/`; `npm run check:all` rebuilds and runs syntax/consistency checks across the
whole project; `npm run desktop:dev` launches the Electron shell locally.

## White-label generator

[`generator/`](generator) is a separate local tool — a small panel you run on your own machine —
for producing a complete, independent, pre-built client deployment from this template in one
step: company branding, a fixed set of delivery/order types, a chosen subset of optional
features, live pricing, and seeded admin accounts.

```bash
cd generator
npm install
npm start          # http://127.0.0.1:4100
```

A few things worth knowing about how it works:

- **Pricing** is computed entirely from [`src/shared/features.js`](src/shared/features.js) — a
  one-time setup fee plus a smaller recurring monthly fee, pre-VAT, shown only in the generator
  panel and never shipped to the client. The base bundle (catalog, cart, orders, network/branch
  management, favorites, back-in-stock alerts, push notifications) is always included; only
  genuinely advanced add-ons (returns with OCR, promotions, banners, offline mode, barcode
  scanning, analytics, multi-language, ERP integrations, multi-employee permissions) are optional
  and separately priced. Removing one hides its nav entry and 404s its API — it never breaks
  layout, since the client renders its nav from a filtered array rather than a fixed grid.
- **Delivery/order types are vendor-locked.** Their number and kind are fixed once in the
  generator at creation time and priced per type beyond the first. From their own admin panel, a
  client can rename an existing type but can never add or remove one — enforced server-side
  (`POST`/`DELETE` on `/api/admin/delivery-types` are rejected, and `PATCH` only ever applies the
  `title` field), not just hidden in the UI.
- **Shipping code updates** to an already-deployed client doesn't require a shared update server:
  the generator exports a version-tagged, code-only zip (no client data or `.env`); an admin with
  the "עדכוני מערכת" permission uploads it from the client's own panel in one click, and the
  server extracts it over the existing code, leaving `data/` and `.env` untouched, then restarts.
  Run the server via `scripts/run-forever.cmd` on LAN/Node deployments so it comes back up
  automatically after an applied update; the Electron desktop build relaunches itself the same way.
- Every generated client gets its own random encryption key and its own seeded owner account, plus
  a fixed support account so you can always log in to help. Client folders are never checked into
  version control — they live under `../clients/` outside this repository.
