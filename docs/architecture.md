# OCHWORLD architecture

How the system is built, why, and the rules for changing it. Read this before
adding a feature. Status and open items live in [project-status.md](project-status.md);
visual rules in [design-system.md](design-system.md).

## 1. What the system is

A multi-tenant property marketplace for Abuja (FCT). Three kinds of user:

| Who | What they do |
|---|---|
| **Visitors / seekers** | Search and view published listings, save favourites, send enquiries |
| **Organizations** (estate agencies, landlords, developers) | Manage their own listings, photos, enquiries and team |
| **Platform admins** | Moderate everything (Phase 6) |

An **organization is the tenant**. Users join organizations as `owner`, `admin`
or `agent`. One user can belong to several organizations.

## 2. System overview

```
 Browser / phone
      │  HTTPS
      ▼
 ┌──────────────────────── Vercel: Next.js 15 (App Router) ─────────────────────┐
 │ middleware.ts   refreshes the session cookie; guards /dashboard, /onboarding │
 │                                                                              │
 │ app/            routes: (site) public · (auth) sign-in/up/invite ·           │
 │                 dashboard/ members · auth/ callbacks                         │
 │      │                                                                       │
 │ components/     UI only: ui/ primitives → feature folders                    │
 │      │                                                                       │
 │ lib/<domain>/   queries.ts (reads) · actions.ts (writes, "use server")       │
 │ lib/validations zod rules shared by forms and server actions                 │
 │ lib/supabase    the only place database clients are created                  │
 └───────────────────────────────┬──────────────────────────────────────────────┘
          runs as the signed-in  │  user (publishable key + their session)
                                 ▼
 ┌────────────────────────────── Supabase ──────────────────────────────────────┐
 │ Postgres + Row Level Security   ← the security boundary                      │
 │ Auth (email/password, Google, Apple)                                         │
 │ Storage: property-images/<organization_id>/<property_id>/<file>              │
 └──────────────────────────────────────────────────────────────────────────────┘

 GitHub ──push──▶ GitHub Actions: app checks + database tests ──pass──▶ supabase db push
        └──push──▶ Vercel build + deploy
```

## 3. Core decisions (and why)

Short decision records. Change one only with a reason written here.

**D1. The database enforces security, not the app.**
Every request reaches Postgres as the signed-in user (or anonymous), never with
an admin key, so Row Level Security (RLS) policies decide what each person can
read or write. A bug in a page or a forged request cannot reach another
tenant's data. The app's own role checks (`lib/auth/permissions.ts`) only
decide what to *show*. The secret key is used only by local admin scripts
(`scripts/`), never by the website.

**D2. Organizations are the tenancy boundary.**
Listings, photos, enquiries and invitations all hang off `organization_id`.
Membership (`organization_members`) and platform admins (`platform_admins`)
are tables, not user metadata, because users can edit their own metadata.
Policies use small `SECURITY DEFINER` helpers (`is_org_member`,
`has_org_role`, `is_platform_admin`) so they stay readable and don't recurse.

**D3. Server-rendered pages, server actions for writes.**
Pages are React Server Components that read data on the server; writes are
Next.js server actions that validate input again with the same zod schema
the form uses. Only interactive bits (forms, hearts, photo uploads) are client
components. Result: little JavaScript on phones, no separate REST API to
maintain.

**D4. The URL is the state for search.**
Filters live in query parameters (`/properties?listing=rent&district=jabi`),
parsed forgivingly by `lib/properties/filters.ts`. Results are shareable,
bookmarkable and work without JavaScript.

**D5. View-models between database and UI.**
Components receive types from `lib/*/types.ts` (e.g. `PropertyCardData`), built
by mapper functions. A schema change touches a mapper, not every screen.

**D6. Schema as code, applied by CI.**
The database is defined by numbered files in `supabase/migrations/`. CI builds
a fresh database from them and runs the security tests on every push; only
then does it apply new migrations to production. Nobody edits the live schema
by hand.

**D7. Photos upload directly from the browser to Storage.**
The browser resizes to 2000px JPEG (saves Nigerian mobile data, strips GPS
metadata) and uploads into the organization's folder; Storage policies allow
only that organization's members. The server action then checks the path and
records it. Files never pass through our server.

**D8. Invitations are links, not emails.**
Owners/admins create a single-use, 14-day link tied to an email address and
share it however they like (WhatsApp is common). No email provider needed; the
invitee must sign in with the invited email to accept.

**D9. Privacy by default.**
Enquirer details are visible only to the receiving organization. Private
landlords' phone numbers are never public (`organization_contacts` view).
Emails are never public.

## 4. Code layout

```
src/
  app/                    routes only: fetch data, compose components, handle params
    (site)/               public marketplace (home, properties, areas, agents)
    (auth)/               sign-in, sign-up, onboarding, password, invite/[token]
    dashboard/            signed-in area: overview, listings, enquiries, team
    auth/                 OAuth callback, sign-out (route handlers)
  components/
    ui/                   design-system primitives (button, input, badge…), no data
    brand/ feedback/ layout/      logo, loaders, empty/error states, header/footer
    <feature>/            property, search, home, listings, dashboard, auth…
  lib/
    auth/                 account (who is signed in), permissions (what to show), errors
    properties/           public marketplace: queries, filters, mappers, types, constants
    listings/             listing management for organizations: queries, actions
    enquiries/            inbox + sent enquiries: queries, actions
    team/                 members + invitations: queries, actions
    dashboard/            overview aggregates (favourites, stats)
    validations/          zod schemas shared by client and server
    supabase/             client factories, middleware helper, database types
    errors.ts format.ts utils.ts
  config/site.ts          name, navigation, locale
supabase/
  migrations/             schema + RLS, applied in order (by CI)
  tests/                  SQL security tests + plain-Postgres shim
  seed.sql                local test data only
scripts/                  admin scripts (secret key, run locally) + test-db.sh
tests/unit/               app unit tests (Node test runner)
```

**Dependency direction:** `app → components → lib`. `lib` never imports from
`components` or `app`. Client components may import `lib` validations, server
actions and *types* (`import type`), but never call `lib/*/queries.ts`
functions (those need the server's cookies).

## 5. Conventions

- **Reads** go in `lib/<domain>/queries.ts`, are server-only, throw
  `DataLoadError` on failure, and return view-models, not raw rows.
- **Writes** go in `lib/<domain>/actions.ts` with `"use server"`. They validate
  with zod, return a typed result (`{ ok: false, message }` or a form state),
  log the technical error with `console.error`, and show a friendly message.
- **Pages** catch load errors and render `ErrorState`; empty lists render
  `EmptyState` with a next step.
- **Forms** share their zod schema with the action (`lib/validations`).
- **Styling** uses design tokens only (no raw colours, no gradients); see the
  design system.
- **Naming**: files `kebab-case.tsx`, components `PascalCase`, database
  `snake_case`.

## 6. Data model (summary)

```
auth.users ─1:1─ profiles (full_name, phone, onboarded_at)
     │
     ├─< organization_members >─ organizations (agency | landlord | developer)
     │        role: owner | admin | agent           │
     ├─< platform_admins                            ├─< properties ─< property_images
     ├─< saved_properties >─ properties             ├─< enquiries (status: new/responded/closed)
     └─ (accepts) organization_invitations >────────┘
districts (25 Abuja districts) ─< properties
```

Full definitions and policies: `supabase/migrations/`.

## 7. Testing

| Layer | What | Where | Runs |
|---|---|---|---|
| Database security | 100+ RLS checks: tenant isolation, roles, invitations, privacy, constraints | `supabase/tests/*.test.sql` via `scripts/test-db.sh` | CI on every push |
| App logic | URL filters, redirect safety, validation schemas, formatting | `tests/unit/*.test.ts` (`npm test`) | CI + locally |
| Types | Whole codebase, strict mode | `npm run typecheck` | CI + locally |
| Build | Production build succeeds | `npm run build` | CI + Vercel |

Not yet covered (Phase 7): browser end-to-end tests, accessibility audit,
linting/formatting (needs ESLint + Prettier installed).

## 8. Delivery pipeline

1. Work locally (`npm run dev`, `npm test`, `npm run typecheck`).
2. Push to `main` (or open a pull request).
3. **CI** (`.github/workflows/ci.yml`): app checks and database tests in
   parallel. If either fails, nothing reaches the database.
4. **Migrate** (main only): applies new migrations to Supabase.
5. **Vercel** builds and deploys the site.

### Changing the database

1. Add a **new** file: `supabase/migrations/<YYYYMMDDhhmmss>_<what>.sql`.
   Never edit a migration that has already run.
2. Write it to be safe to run twice (`if not exists`, `create or replace`,
   `drop policy if exists` before `create policy`).
3. Add checks to `supabase/tests/` for any new table or policy.
4. Update `src/lib/supabase/database.types.ts`.
5. Push. CI tests it, then applies it.

## 9. Environments and secrets

| Where | Values | Notes |
|---|---|---|
| `.env.local` (your computer, git-ignored) | Supabase URL, publishable key, site URL, `SUPABASE_SECRET_KEY` | Secret key only for `scripts/` |
| Vercel | Supabase URL, publishable key, site URL | **Never** the secret key |
| GitHub Actions secrets | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID` | Used only by the migrate job |

## 10. Known gaps

Tracked in [project-status.md](project-status.md). Main ones: generated
database types (currently hand-written, with a client cast for an
`@supabase/ssr` typing mismatch), enquiry rate limiting, a script CSP with
nonces, ESLint/Prettier, and end-to-end tests.
