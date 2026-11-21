# OCHWORLD Web

Abuja property marketplace (web). Next.js 15 (App Router), TypeScript, Tailwind CSS,
shadcn/ui and Supabase.

- **Design system:** [`docs/design-system.md`](docs/design-system.md), live at `/design-system` in development.
- **Project status, decisions and open issues:** [`docs/project-status.md`](docs/project-status.md).

Currently built: the public marketplace (homepage, search, listings, property pages, areas, agents),
authentication (Google, Apple, email + password) and the design system.
Organization membership, roles and onboarding are in place; listing management and admin tools follow.

**Start here:** [docs/architecture.md](docs/architecture.md) explains how the system is built and the rules for changing it.

## Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Run the site at http://localhost:3000 |
| `npm test` | App unit tests (Node 22.18+) |
| `npm run typecheck` | Check types across the codebase |
| `npm run build` | Production build (what Vercel runs) |
| `npm run test:db` | Database security tests against an empty Postgres (CI runs this; needs `DATABASE_URL` and `psql`) |
| `npm run samples:add` / `samples:remove` | Add/remove the 10 sample listings (needs `SUPABASE_SECRET_KEY`) |
| `npm run test-accounts:add` / `test-accounts:remove` | Create/remove test logins (needs `SUPABASE_SECRET_KEY`) |

Every push runs the CI pipeline (`.github/workflows/ci.yml`): checks and database tests first, then new migrations are applied to Supabase.

## 1. Install

```bash
npm install
```

## 2. Connect Supabase

1. Create a project at https://supabase.com (or open your existing one).
2. Copy `.env.example` to `.env.local` and fill it in from **Project Settings → API**:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: add `http://localhost:3000/auth/callback` (and your live domain's `/auth/callback` later)
4. **SQL Editor** → run the files in `supabase/migrations/` **in order** (profiles, listings, tenancy, explicit grants, listing management), or paste `supabase/setup-all.sql` once on a new project.
   After that, **new migrations apply automatically**: push to `main` and the CI pipeline
   `.github/workflows/ci.yml` runs them after the checks pass (needs the secrets `SUPABASE_ACCESS_TOKEN`,
   `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_ID`). Add a new file for each change; never edit one that has run.
5. Make yourself super admin (SQL Editor, once you've signed up):
   ```sql
   insert into public.platform_admins (user_id, note)
   select id, 'founder' from auth.users where email = 'you@example.com';
   ```
6. **Development/staging only:** run `supabase/seed.sql` for fictional test listings marked "(test)". Never on production.

## 3. Turn on Google and Apple

**Google** — Supabase → Authentication → Providers → Google
1. In Google Cloud Console → APIs & Services → Credentials, create an *OAuth client ID* (Web application).
2. Authorised redirect URI: `https://<your-project>.supabase.co/auth/v1/callback`
3. Paste the Client ID and Secret into Supabase and enable it.

**Apple** — Supabase → Authentication → Providers → Apple
1. Needs a paid Apple Developer account ($99/year).
2. Create a *Services ID* with "Sign in with Apple", return URL `https://<your-project>.supabase.co/auth/v1/callback`.
3. Create a Sign in with Apple key (.p8), then follow Supabase's form to generate the secret and enable it.

Until a provider is enabled, its button shows a friendly "isn't switched on yet" message.

## 4. Run

```bash
npm run dev
```

Open http://localhost:3000 for the homepage, and http://localhost:3000/design-system for the design system.

## Routes

| Route | What it does |
|---|---|
| `/` | Homepage: hero search, featured listings, categories, popular areas |
| `/properties` | Search with filters in the URL (`listing`, `category`, `type`, `district`, `agency`, `minPrice`, `maxPrice`, `beds`, `sort`, `page`) |
| `/properties/[slug]` | Property page: photos, facts, enquiry form, save, similar listings |
| `/areas` | Districts with listing counts |
| `/agents` | Agencies, developers and landlords |
| `/list-property` | For agents/landlords; sign-up entry point |
| `/sign-in` | Google, Apple or email sign-in |
| `/sign-up` | Account type, name, email, phone, password strength, terms |
| `/forgot-password` | Sends a reset link |
| `/update-password` | Set a new password (from the reset email) |
| `/auth/callback` | Finishes Google/Apple/email-link sign-in |
| `/auth/sign-out` | POST — signs out |
| `/onboarding` | One-time account setup after sign-up (seeker, agency, landlord, developer) |
| `/dashboard` | Signed-in home: organization stats and latest enquiries for members; favourites and sent enquiries for everyone |
| `/dashboard/listings` | Organization members: all listings by status; publish, unpublish, archive, delete (owners/admins) |
| `/dashboard/listings/new` | Add a listing (saved as a draft, then photos) |
| `/dashboard/listings/[id]/edit` | Edit details, upload and order photos, publish |
| `/dashboard/enquiries` | Enquiry inbox with status (new / responded / closed) |
| `/dashboard/team` | Members, invite links (owners/admins), remove or leave |
| `/invite/[token]` | Accept a team invitation |
| `/design-system` | Design system reference (development only) |

## Project structure

See [docs/architecture.md](docs/architecture.md#4-code-layout) for the full layout, layering rules and conventions. In short: `src/app` routes, `src/components` UI, `src/lib/<domain>` data access (queries and server actions), `supabase/migrations` the database, `tests/` and `supabase/tests/` the tests.

Add more shadcn components any time with `npx shadcn@latest add <name>`.
