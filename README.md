# OCHWORLD Web

Abuja property marketplace (web). Next.js 15 (App Router), TypeScript, Tailwind CSS,
shadcn/ui and Supabase.

- **Design system:** [`docs/design-system.md`](docs/design-system.md), live at `/design-system` in development.
- **Project status, decisions and open issues:** [`docs/project-status.md`](docs/project-status.md).

Currently built: authentication (Google, Apple, email + password) and the design system.
Property discovery, tenants and dashboards follow in later phases.

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
4. **SQL Editor** → paste and run `supabase/schema.sql` (creates the `profiles` table).

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

Open http://localhost:3000 → you land on **/sign-in** (until the Phase 3 homepage), and http://localhost:3000/design-system for the design system.

## Routes

| Route | What it does |
|---|---|
| `/sign-in` | Google, Apple or email sign-in |
| `/sign-up` | Account type, name, email, phone, password strength, terms |
| `/forgot-password` | Sends a reset link |
| `/update-password` | Set a new password (from the reset email) |
| `/auth/callback` | Finishes Google/Apple/email-link sign-in |
| `/auth/sign-out` | POST — signs out |
| `/dashboard` | Protected page (redirects to sign-in when logged out) |
| `/design-system` | Design system reference (development only) |

## Project structure

```
src/
├─ app/
│  ├─ (auth)/              # black layout with brand panel
│  │  ├─ sign-in/  sign-up/  forgot-password/  update-password/
│  ├─ auth/callback/       # OAuth + email link handler
│  ├─ auth/sign-out/
│  ├─ dashboard/           # protected placeholder page
│  ├─ design-system/       # living design reference (dev only)
│  ├─ error.tsx  not-found.tsx  loading.tsx
│  ├─ globals.css          # light/dark theme tokens
│  └─ layout.tsx           # fonts (Montserrat + Inter), metadata
├─ components/
│  ├─ ui/                  # shadcn/ui primitives: button, input, select, card, badge, skeleton…
│  ├─ auth/                # forms, OAuth buttons, password field, strength meter…
│  ├─ brand/               # logo, BrandLoader
│  ├─ feedback/            # empty and error states
│  ├─ layout/              # site header, mobile nav
│  ├─ property/            # property card + skeleton
│  └─ icons.tsx            # Google + Apple marks
├─ config/site.ts          # name, tagline, navigation
├─ lib/
│  ├─ supabase/            # browser, server and middleware clients
│  ├─ validations/auth.ts  # zod schemas
│  ├─ properties/types.ts  # PropertyCardData view-model
│  ├─ format.ts            # naira / price formatting
│  ├─ auth-errors.ts       # friendly error copy
│  └─ utils.ts             # cn()
└─ middleware.ts           # refreshes session, guards /dashboard
supabase/schema.sql        # profiles table + trigger (to be replaced by migrations in Phase 4)
docs/                      # design system, project status
```

Add more shadcn components any time with `npx shadcn@latest add <name>`.
