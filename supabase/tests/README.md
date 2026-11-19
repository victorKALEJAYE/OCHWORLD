# Database tests

`rls_listings.test.sql` checks the row-level security and constraints from the
listings migration: what anonymous visitors and signed-in users can read and
write. Every check prints `PASS` or `FAIL`; the whole run is wrapped in a
transaction and rolled back, so it leaves no data behind.

## With the Supabase CLI (recommended)

```bash
supabase db reset                      # applies migrations + seed.sql locally
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2- | tr -d '\"')" \
  -f supabase/tests/rls_listings.test.sql | grep -E "PASS|FAIL"
```

## With plain PostgreSQL 15+

`plain-postgres-shim.sql` creates the minimum Supabase pieces the migrations
need (`anon`/`authenticated` roles, `auth.users`, `auth.uid()`,
`storage.buckets`). **Test databases only.**

```bash
createdb och_test
for f in supabase/tests/plain-postgres-shim.sql supabase/migrations/*.sql supabase/seed.sql; do
  psql -d och_test -v ON_ERROR_STOP=1 -q -f "$f"
done
psql -d och_test -q -f supabase/tests/rls_listings.test.sql 2>&1 | grep -E "PASS|FAIL"
```

Last run (Phase 3): 27 passed, 0 failed.
