# Project status

Tracks completed phases, decisions and open issues. Update at the end of each phase.

## Phases

| Phase | Status |
|---|---|
| 1. Codebase and architecture audit | Done (findings below) |
| 2. Brand identity and design system | Done |
| 3. Public website and property discovery | Done |
| 4. Authentication and multi-tenant access | Done |
| 5. Agent and landlord dashboards | Done, awaiting review |
| 6. Super admin dashboard | Not started |
| 7. Integration, testing and optimisation | Not started |

## Working assumptions (confirm or change)

These were proposed in the Phase 1 audit and are being used until confirmed:

- **Tenant = organisation.** Agencies, landlord businesses and independent agents each own an organisation; members join with a role; listings, clients and enquiries belong to the organisation; seekers are platform users; super admins are in a separate `platform_admins` table. Shared database, isolation by RLS on `organization_id`.
- **Brand gold = `#C38C25`, black = `#000000`**, measured from the logo JPG until the designer's source file is supplied.
- **Seed data** is allowed only in a clearly labelled `supabase/seed.sql` for local and staging databases.
- **Scope** is the web app; the Expo mobile app is out of scope for now.

## Open issues from the Phase 1 audit

Security (fix in Phase 4, before real data):

1. `profiles` UPDATE policy lets a user change their own `role` column.
2. Account type is stored in `user_metadata`, which users can edit. It must never drive authorisation. (Phase 2 stopped the dashboard from displaying it.)
3. Middleware skips protection when Supabase env vars are missing; it should fail closed in production.
4. No tenant model (organisations, memberships, platform admins).
5. Database types are hand-written (`src/lib/supabase/database.types.ts`); generate them once the Supabase CLI is linked. `profiles.updated_at` is never updated (listings tables have a trigger).
6. No security headers (CSP etc.) in `next.config.ts`.

Product:

8. Google/Apple sign-ups never choose an account type (Phase 4 onboarding).
9. `/terms` and `/privacy` pages don't exist.

Engineering:

10. No ESLint/Prettier, tests or CI.
11. Supabase project state unknown: confirm whether the profiles migration (formerly `supabase/schema.sql`) was run, then apply the listings migration.

Resolved in Phase 2: off-brand colours, gradients and decorative effects, six competing loaders, `CheckEmailCard` placement, every card title rendered as `h1`, hard-coded `rgba()` colours, placeholder dashboard features presented as real.

## Phase 3 decisions

- **Listings belong to an organization** (`properties.organization_id`) from day one, so Phase 4 only adds membership on top.
- **Public read, no public write.** RLS lets anyone read organizations, districts and *published* listings/images. Nobody can write listings yet (no INSERT/UPDATE/DELETE policies) until Phase 4/5 adds membership-based policies.
- **Enquiries**: anyone (guest or signed in) can send one on a published listing. A trigger sets `organization_id` from the property and `sender_user_id` from the session, so neither can be spoofed. Nobody can read enquiries until Phase 4. A honeypot field blocks simple bots; **rate limiting is still needed** before launch (Supabase captcha or an edge rate limit).
- **Contact details are protected in the database**, not just hidden in the UI: the public roles can't read `organizations.phone`/`email` at all. Business phone numbers come from the `organization_contacts` view, which returns null for private landlords (they're reached through enquiries). Emails are never public.
- **Filters live in the URL** and forms are plain GET forms, so search works without JavaScript and every search can be shared.
- **Sign-up only when needed**: browsing never asks for an account; saving a property sends signed-out visitors to sign in and back.
- `@supabase/ssr` 0.5's types don't match the installed `@supabase/supabase-js`; the clients are cast to `SupabaseClient<Database>` (documented in `lib/supabase/server.ts`). Upgrade `@supabase/ssr` and remove the cast.

## Phase 3 open items

- No photos yet: uploads come with the agent dashboard (Phase 5). Seed data has none; cards show a placeholder.
- Area ratings (security, power, water) need a real data source before they appear on `/areas`.
- Saving from listing cards (not just the property page) and a "Saved homes" page come with the seeker dashboard.
- `/terms` and `/privacy` pages still don't exist (content needed from OCHWORLD).

Tests: `supabase/tests/rls_listings.test.sql`, 27 checks, all passing on PostgreSQL 16 (Phase 3).

## Phase 4 decisions

- **Roles live in the database only.** `profiles.role` (user-editable) is removed. Roles come from `organization_members` (owner / admin / agent per organization) and `platform_admins`. Sign-up metadata carries display details only.
- **Column-level privileges + RLS.** RLS decides *which rows*; grants decide *which columns*. Users can edit only their profile's name/phone/avatar; organization slug and type are fixed after creation; enquiries allow only `status` to change.
- **Helper functions** (`is_org_member`, `has_org_role`, `is_platform_admin`, `shares_organization_with`, `can_manage_property`) are `SECURITY DEFINER` + `STABLE` so policies stay short and don't recurse through each other's RLS.
- **Role rules:** agents create and edit their organization's listings and handle enquiries; owners and admins also delete listings and manage members; only owners create owners; an organization always keeps at least one owner.
- **Onboarding** (`/onboarding`) is the single place an account type is chosen, for email, Google and Apple sign-ups alike. Professionals get an organization created by the `complete_onboarding` database function, with themselves as owner, in one transaction.
- **Super admins** are added only with SQL by the project owner (see README); nothing in the app can grant it.
- **Storage:** listing photos go to `property-images/<organization_id>/<property_id>/<file>`; only members of that organization can upload, replace or delete there.
- **Middleware fails closed in production** when Supabase isn't configured; **security headers** added (`nosniff`, frame blocking, referrer policy, HSTS, permissions policy). A full script CSP with nonces is left for Phase 7.

Resolved in Phase 4: audit issues 1 (role escalation), 2 (metadata roles), 3 (middleware fail-open), 4 (tenant model), 6 (security headers, partially: script CSP pending), 8 (OAuth account type).

## Phase 4 open items

- ~~Invitation flow~~: done in Phase 5 (invite links).
- Users created before migration 3 have `onboarded_at` empty and will see onboarding once on next sign-in.
- Tests: `supabase/tests/rls_tenancy.test.sql`, 49 checks, all passing alongside the 27 listings checks.

## Phase 5 decisions

- **Listing workflow**: details → photos → publish. New listings start as drafts; drafts and archived listings are visible only to the organization (RLS). Slugs are generated once from the title plus a random suffix and never change, so shared links keep working.
- **Category follows property type** (apartment → residential, office → commercial, land → land) so agents choose one field, not two.
- **Photos upload straight from the browser to Supabase Storage** at `property-images/<org>/<listing>/<random>.jpg`. The browser resizes to 2000 px and re-encodes as JPEG (saves mobile data, removes phone location data). The server action checks the path belongs to the listing before recording it. Up to 20 photos; the first is the cover.
- **Only platform admins can feature listings** (database trigger silently keeps `is_featured` for everyone else).
- **Deleting** is owners/admins only and removes the photo files too. Agents can unpublish or archive.
- **Enquiry inbox** opens on "New"; status changes (new / responded / closed) save on pick.
- **Team invitations are links, not emails**: owners/admins create a link for an email address and share it (copy or WhatsApp). The invitee must be signed in with that exact email; links work once and expire after 14 days. No email provider needed. Invited members skip onboarding.
- Agents see teammates' names; only owners/admins see their emails (`organization_team()`).

## Phase 5 open items

- Run `supabase/migrations/20261121000005_listing_management.sql` in the Supabase SQL Editor (after migrations 1–4).
- Optional later: send invitations by email (needs an email provider such as Resend), drag-to-reorder photos, listing analytics (views, enquiries per listing).
- Tests: `supabase/tests/rls_management.test.sql`, 30 checks. All 106 database checks pass on PostgreSQL 16.

## Engineering quality (between Phases 5 and 6)

- `docs/architecture.md`: system overview, decision records, code layout, conventions, testing and delivery pipeline.
- `lib/` reorganised by domain: `auth` (account, permissions, errors), `properties`, `listings`, `enquiries`, `team`, `dashboard`; shared `DataLoadError` in `lib/errors.ts`.
- App unit tests with Node's built-in runner (`npm test`, 35 tests): URL filters, redirect safety, listing and enquiry validation, formatting.
- **Security fix:** `safeNextPath` accepted `/\evil.com`, which browsers treat as `//evil.com` (open redirect after sign-in). Now rejected, with tests.
- CI pipeline (`.github/workflows/ci.yml`) replaces `database.yml`: typecheck + unit tests + build, and the database rebuilt from migrations in a throwaway Postgres with all RLS tests; migrations reach Supabase only if both pass.
- Still to add (needs package installs): ESLint + Prettier, browser end-to-end tests (Playwright).
