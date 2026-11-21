#!/usr/bin/env bash
# Builds the whole database from the migrations on an EMPTY Postgres and runs
# the security test suites (supabase/tests/*.test.sql). Fails if any check fails.
#
#   DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres npm run test:db
#
# Used by CI (.github/workflows/ci.yml) with a throwaway Postgres container.
# Never point it at the live Supabase database.
set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL to an empty test database}"
case "$DATABASE_URL" in *supabase.co*|*supabase.com*) echo "Refusing to run against a Supabase-hosted database." >&2; exit 1;; esac

cd "$(dirname "$0")/.."
psql_q() { psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q "$@"; }

echo "▸ Building the database from migrations"
psql_q -f supabase/tests/plain-postgres-shim.sql
for f in supabase/migrations/*.sql; do echo "  $f"; psql_q -f "$f"; done
psql_q -f supabase/seed.sql

echo "▸ Re-running migrations 4+ to prove they are safe to run twice"
for f in supabase/migrations/*.sql; do
  version="$(basename "$f" | cut -d_ -f1)"
  if [ "$version" -ge 20261120000004 ]; then psql_q -f "$f"; fi
done

echo "▸ Running security tests"
output="$(psql "$DATABASE_URL" -q $(printf -- '-f %s ' supabase/tests/*.test.sql) 2>&1)"
pass=$(grep -c "PASS" <<<"$output" || true)
fail=$(grep -c "FAIL" <<<"$output" || true)
errors=$(grep -c "ERROR:" <<<"$output" || true)
grep -E "FAIL|ERROR:" <<<"$output" || true
echo "PASS: $pass  FAIL: $fail  unexpected errors: $errors"
if [ "$fail" -ne 0 ] || [ "$errors" -ne 0 ] || [ "$pass" -eq 0 ]; then exit 1; fi
