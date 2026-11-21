# Database tests

Two suites, each printing `PASS`/`FAIL` per check:

- `rls_listings.test.sql`: public access to listings, enquiries, saved properties, contact privacy and data constraints (migration 2).
- `rls_management.test.sql`: listing management, featuring, invitations and team list (migration 5).
- `rls_tenancy.test.sql`: tenant isolation and roles across two organizations, an agent, a seeker and a platform admin; onboarding; storage uploads (migration 3).

 Each run is wrapped in a transaction and rolled back, so it leaves no data behind.

## With the Supabase CLI (recommended)

```bash
supabase db reset                      # applies migrations + seed.sql locally
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2- | tr -d '\"')" \
  -f supabase/tests/rls_listings.test.sql -f supabase/tests/rls_tenancy.test.sql -f supabase/tests/rls_management.test.sql | grep -E "PASS|FAIL"
```

## With plain PostgreSQL 15+

`plain-postgres-shim.sql` creates the minimum Supabase pieces the migrations
need (`anon`/`authenticated` roles, `auth.users`, `auth.uid()`,
`storage.buckets`, `storage.objects`). **Test databases only.**

```bash
createdb och_test
for f in supabase/tests/plain-postgres-shim.sql supabase/migrations/*.sql supabase/seed.sql; do
  psql -d och_test -v ON_ERROR_STOP=1 -q -f "$f"
done
psql -d och_test -q -f supabase/tests/rls_listings.test.sql -f supabase/tests/rls_tenancy.test.sql -f supabase/tests/rls_management.test.sql 2>&1 | grep -E "PASS|FAIL"
```

Last run (Phase 5, PostgreSQL 16): listings 27/27, tenancy 49/49, management 30/30 passed.
