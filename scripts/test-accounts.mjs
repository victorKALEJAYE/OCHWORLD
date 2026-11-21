#!/usr/bin/env node
/**
 * Creates (or removes) test login accounts for trying every part of OCHWORLD.
 *
 *   npm run test-accounts:add      create the accounts / give them new passwords
 *   npm run test-accounts:remove   delete them all (do this before launch)
 *
 * Accounts (all @example.com, a reserved domain, so no real person gets mail):
 *   seeker@example.com          someone looking for a home
 *   agency.owner@example.com    owner of "OCHWORLD Sample Listings" (sees the 10 sample listings)
 *   agency.agent@example.com    agent in the same agency
 *   landlord@example.com        owner of "Test Landlord (test)", an empty landlord account
 *   admin@example.com           platform admin (super admin, Phase 6)
 *
 * Passwords are random, printed once and saved to test-accounts.local.md in
 * this folder (git-ignored). Running `add` again gives everyone new passwords.
 *
 * Needs in .env.local: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY
 * (Supabase → Project Settings → API Keys → Secret key). Admin script only:
 * the secret key bypasses all security rules, so never put it in Vercel or GitHub.
 */
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { checkTarget } from "./lib/target.mjs";

const SAMPLE_ORG = {
  name: "OCHWORLD Sample Listings",
  slug: "ochworld-sample-listings",
  type: "agency",
  about: "Demonstration listings used while OCHWORLD is being set up. Not real properties.",
};
const LANDLORD_ORG = {
  name: "Test Landlord (test)",
  slug: "test-landlord-test",
  type: "landlord",
  about: "Test account. Not a real landlord.",
};

const ACCOUNTS = [
  { email: "seeker@example.com", name: "Test Seeker", role: "Seeker: browse, favourites, enquiries" },
  { email: "agency.owner@example.com", name: "Test Agency Owner", org: "sample", orgRole: "owner", role: "Agency owner: listings, enquiries, team, delete" },
  { email: "agency.agent@example.com", name: "Test Agency Agent", org: "sample", orgRole: "agent", role: "Agency agent: listings and enquiries (can't delete or invite)" },
  { email: "landlord@example.com", name: "Test Landlord", org: "landlord", orgRole: "owner", role: "Landlord: own empty account" },
  { email: "admin@example.com", name: "Test Admin", platformAdmin: true, role: "Platform admin: can feature listings (Phase 6 tools)" },
];

const OUTPUT_FILE = "test-accounts.local.md";

function fail(message, error) {
  console.error(`\n✖ ${message}`);
  if (error) console.error(`  ${error.code ?? ""} ${error.message ?? error}${error.hint ? `\n  hint: ${error.hint}` : ""}`);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url) fail("NEXT_PUBLIC_SUPABASE_URL is missing from .env.local");
if (!secret || secret.startsWith("PASTE")) fail("SUPABASE_SECRET_KEY is missing from .env.local (Supabase → Project Settings → API Keys → Secret key).");
if (secret.startsWith("sb_publishable_")) fail("SUPABASE_SECRET_KEY is the publishable key. Use the Secret key (sb_secret_...).");

checkTarget(url);

const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

/** 16 characters, letters and digits plus a symbol, easy to type. */
function newPassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(15);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("") + "!";
}

async function findUsersByEmail() {
  const found = new Map();
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) fail("Couldn't list users.", error);
    for (const u of data.users) if (u.email) found.set(u.email.toLowerCase(), u);
    if (data.users.length < 200) break;
  }
  return found;
}

async function upsertOrg(org) {
  const { data, error } = await supabase.from("organizations").upsert(org, { onConflict: "slug" }).select("id").single();
  if (error) fail(`Couldn't create the organization "${org.name}". Did the database migrations run?`, error);
  return data.id;
}

async function add() {
  const orgIds = { sample: await upsertOrg(SAMPLE_ORG), landlord: await upsertOrg(LANDLORD_ORG) };
  const existing = await findUsersByEmail();
  const rows = [];

  for (const account of ACCOUNTS) {
    const password = newPassword();
    let user = existing.get(account.email);

    if (user) {
      const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
        password,
        email_confirm: true,
        user_metadata: { full_name: account.name },
      });
      if (error) fail(`Couldn't update ${account.email}.`, error);
      user = data.user;
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: account.email,
        password,
        email_confirm: true, // no confirmation email; can sign in straight away
        user_metadata: { full_name: account.name },
      });
      if (error) fail(`Couldn't create ${account.email}.`, error);
      user = data.user;
    }

    // Profile: named and past onboarding, so the dashboard opens directly.
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: account.name, onboarded_at: new Date().toISOString() }, { onConflict: "id" });
    if (profileError) fail(`Couldn't set up the profile for ${account.email}.`, profileError);

    if (account.org) {
      const { error } = await supabase
        .from("organization_members")
        .upsert(
          { organization_id: orgIds[account.org], user_id: user.id, role: account.orgRole },
          { onConflict: "organization_id,user_id" }
        );
      if (error) fail(`Couldn't add ${account.email} to the organization.`, error);
    }

    if (account.platformAdmin) {
      const { error } = await supabase
        .from("platform_admins")
        .upsert({ user_id: user.id, note: "Test account (scripts/test-accounts.mjs)" }, { onConflict: "user_id" });
      if (error) fail(`Couldn't make ${account.email} a platform admin.`, error);
    }

    rows.push({ ...account, password });
  }

  const table = [
    "| Email | Password | What it's for |",
    "|---|---|---|",
    ...rows.map((r) => `| ${r.email} | ${r.password} | ${r.role} |`),
  ].join("\n");

  writeFileSync(
    OUTPUT_FILE,
    `# OCHWORLD test accounts\n\nCreated ${new Date().toLocaleString("en-NG")}. Sign in at /sign-in with email and password.\nDo not commit or share this file. Remove the accounts before launch: npm run test-accounts:remove\n\n${table}\n`
  );

  console.log("\n✔ Test accounts ready. Sign in with email + password:\n");
  console.table(rows.map((r) => ({ email: r.email, password: r.password, for: r.role })));
  console.log(`\nAlso saved to ${OUTPUT_FILE} (git-ignored).`);
  console.log("Tip: run `npm run samples:add` too, so the agency accounts have listings to manage.");
}

async function remove() {
  const existing = await findUsersByEmail();
  const testIds = new Set(ACCOUNTS.flatMap((a) => (existing.get(a.email) ? [existing.get(a.email).id] : [])));

  // Organizations must always keep an owner, so a test owner can only go if
  // their organization goes too (or someone real also owns it).
  const { error: landlordError } = await supabase.from("organizations").delete().eq("slug", LANDLORD_ORG.slug);
  if (landlordError) fail("Couldn't remove the test landlord organization.", landlordError);

  const { data: sample } = await supabase.from("organizations").select("id").eq("slug", SAMPLE_ORG.slug).maybeSingle();
  if (sample) {
    const { data: owners, error } = await supabase
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", sample.id)
      .eq("role", "owner");
    if (error) fail("Couldn't check the sample organization's owners.", error);
    const realOwners = owners.filter((o) => !testIds.has(o.user_id));
    if (owners.length > 0 && realOwners.length === 0) {
      const { error: sampleError } = await supabase.from("organizations").delete().eq("id", sample.id);
      if (sampleError) fail("Couldn't remove the sample organization.", sampleError);
      console.log("• Removed the sample listings too (their only owner was a test account). Restore with: npm run samples:add");
    }
  }

  let removed = 0;
  for (const account of ACCOUNTS) {
    const user = existing.get(account.email);
    if (!user) continue;
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) fail(`Couldn't delete ${account.email}.`, error);
    removed++;
  }
  console.log(`✔ Removed ${removed} test account(s) and the test landlord organization.`);
}

const mode = process.argv[2];
if (mode === "add") await add();
else if (mode === "remove") await remove();
else fail("Usage: node scripts/test-accounts.mjs add|remove");
