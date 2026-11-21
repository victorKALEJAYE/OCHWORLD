/**
 * Shared by the admin scripts: which Supabase project are we about to change?
 *
 * .env.local should point at STAGING (local development and test data live
 * there). The scripts refuse to write to PRODUCTION unless you add
 * --production on purpose, e.g.:
 *   npm run test-accounts:remove -- --production
 */
export const PRODUCTION_PROJECT_ID = "rtosuaubgdeilywnefla";

export function checkTarget(url) {
  const isProduction = url.includes(`${PRODUCTION_PROJECT_ID}.supabase.co`);
  const allowed = process.argv.includes("--production");
  if (isProduction && !allowed) {
    console.error(
      "\n✖ .env.local points at the PRODUCTION database (the live site).\n" +
        "  Put the STAGING project's URL and secret key in .env.local, or, if you\n" +
        "  really mean production, run the command again with: -- --production\n"
    );
    process.exit(1);
  }
  console.log(isProduction ? "⚠ Target: PRODUCTION (live site)" : "Target: staging / non-production");
  return isProduction;
}
