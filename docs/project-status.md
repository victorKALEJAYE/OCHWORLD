# Project status

Tracks completed phases, decisions and open issues. Update at the end of each phase.

## Phases

| Phase | Status |
|---|---|
| 1. Codebase and architecture audit | Done (findings below) |
| 2. Brand identity and design system | Done, awaiting review |
| 3. Public website and property discovery | Not started |
| 4. Authentication and multi-tenant access | Not started |
| 5. Agent and landlord dashboards | Not started |
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
5. No `supabase/migrations`, no generated database types, `updated_at` never updated.
6. No security headers (CSP etc.) in `next.config.ts`.

Product:

7. `/` redirects to `/sign-in` (Phase 3 replaces it with the marketplace homepage).
8. Google/Apple sign-ups never choose an account type (Phase 4 onboarding).
9. `/terms` and `/privacy` pages don't exist.

Engineering:

10. No ESLint/Prettier, tests or CI.
11. Supabase project state unknown: confirm whether `supabase/schema.sql` was run.

Resolved in Phase 2: off-brand colours, gradients and decorative effects, six competing loaders, `CheckEmailCard` placement, every card title rendered as `h1`, hard-coded `rgba()` colours, placeholder dashboard features presented as real.
