#!/usr/bin/env node
/**
 * Adds (or removes) the 10 OCHWORLD sample listings in your Supabase project.
 *
 *   npm run samples:add      add / update the sample listings
 *   npm run samples:remove   delete all of them (do this before launch)
 *
 * Needs two values in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL   your project URL (already there)
 *   SUPABASE_SECRET_KEY        Project Settings → API Keys → "Secret" key (sb_secret_...)
 *                              or the legacy "service_role" key.
 *
 * Why a secret key: listings can only be written by members of an organization
 * (RLS). This admin script writes as the project owner instead. The secret key
 * bypasses all security rules, so it must ONLY live in .env.local (git-ignored),
 * never in a NEXT_PUBLIC_ variable, never in Vercel, never in chat.
 *
 * Same data as supabase/sample-listings.sql. Safe to run repeatedly.
 */
import { createClient } from "@supabase/supabase-js";

const ORG = {
  name: "OCHWORLD Sample Listings",
  slug: "ochworld-sample-listings",
  type: "agency",
  about: "Demonstration listings used while OCHWORLD is being set up. Not real properties.",
};

const SAMPLE_NOTE = "\n\nSample listing for demonstration only.";

// [district slug, slug, title, description, listing, category, type, price, rent period, address, beds, baths, m², furnished, featured, features, days ago]
const LISTINGS = [
  ["maitama", "sample-5-bed-detached-duplex-maitama", "5-bedroom detached duplex with pool",
    "Detached duplex on a quiet close with a swimming pool, a fitted kitchen and a two-room boys' quarters.",
    "sale", "residential", "duplex", 650_000_000, null, "Off Aso Drive", 5, 6, 750, false, true,
    ["Swimming pool", "Boys' quarters", "Generator", "Parking for 4"], 1],
  ["asokoro", "sample-6-bed-mansion-asokoro", "6-bedroom mansion with cinema room",
    "Large family home with a cinema room, a gym, staff quarters and a landscaped garden.",
    "sale", "residential", "detached_house", 1_500_000_000, null, "Asokoro Extension", 6, 7, 1100, false, true,
    ["Cinema room", "Gym", "Staff quarters", "CCTV"], 2],
  ["wuse-ii", "sample-3-bed-serviced-apartment-wuse-ii", "3-bedroom serviced apartment",
    "Fully serviced apartment with 24-hour power, water, security and a lift.",
    "rent", "residential", "apartment", 10_000_000, "year", "Off Aminu Kano Crescent", 3, 3, 180, true, true,
    ["24-hour power", "Lift", "Gym", "Furnished"], 3],
  ["jabi", "sample-2-bed-apartment-jabi", "2-bedroom apartment near Jabi Lake",
    "Bright apartment a short walk from Jabi Lake Mall, in a gated estate.",
    "rent", "residential", "apartment", 4_500_000, "year", "Jabi Lake area", 2, 2, 110, false, false,
    ["Gated estate", "Swimming pool", "Parking"], 4],
  ["gwarinpa", "sample-4-bed-terrace-gwarinpa", "4-bedroom terrace duplex",
    "Terraced duplex in a gated estate with a boys' quarters and good road access.",
    "sale", "residential", "terrace", 130_000_000, null, "6th Avenue", 4, 5, 300, false, false,
    ["Gated estate", "Boys' quarters", "Prepaid meter"], 5],
  ["katampe", "sample-4-bed-semi-detached-katampe", "4-bedroom semi-detached duplex",
    "New semi-detached duplex with city views, smart lighting and a fitted kitchen.",
    "sale", "residential", "semi_detached_house", 220_000_000, null, "Katampe Extension", 4, 5, 350, false, true,
    ["City views", "Smart home", "Fitted kitchen"], 6],
  ["central-business-district", "sample-office-floor-cbd", "Open-plan office floor",
    "Full office floor with meeting rooms, lifts and backup power in the Central Business District.",
    "rent", "commercial", "office", 35_000_000, "year", "Central Business District", null, 4, 500, false, false,
    ["Lift", "Backup power", "Parking", "Meeting rooms"], 7],
  ["utako", "sample-shop-utako", "Ground-floor shop on a busy road",
    "Shop space with frontage on a busy road, suitable for retail or a pharmacy.",
    "rent", "commercial", "shop", 6_000_000, "year", "Utako District", null, 1, 60, false, false,
    ["Road frontage", "Prepaid meter"], 8],
  ["guzape", "sample-land-plot-guzape", "1,200 m² residential plot",
    "Dry, accessible residential plot with a Certificate of Occupancy.",
    "sale", "land", "land", 280_000_000, null, "Guzape District", null, null, 1200, false, false,
    ["C of O", "Fenced", "Road access"], 9],
  ["lokogoma", "sample-3-bed-bungalow-lokogoma", "3-bedroom bungalow",
    "Detached bungalow with a large compound, a borehole and a fenced yard.",
    "rent", "residential", "bungalow", 3_000_000, "year", "Lokogoma", 3, 3, 220, false, false,
    ["Borehole", "Fenced compound", "Parking"], 10],
];

function fail(message, error) {
  console.error(`\n✖ ${message}`);
  if (error) console.error(`  ${error.code ?? ""} ${error.message ?? error}${error.hint ? `\n  hint: ${error.hint}` : ""}`);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url) fail("NEXT_PUBLIC_SUPABASE_URL is missing from .env.local");
if (!secret || secret.startsWith("PASTE")) {
  fail("SUPABASE_SECRET_KEY is missing from .env.local (Supabase → Project Settings → API Keys → Secret key).");
}
if (secret.startsWith("sb_publishable_")) {
  fail("SUPABASE_SECRET_KEY is the publishable key. Use the Secret key (sb_secret_...) or the service_role key.");
}

const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
const mode = process.argv[2];

async function remove() {
  const { error, count } = await supabase.from("organizations").delete({ count: "exact" }).eq("slug", ORG.slug);
  if (error) fail("Couldn't remove the sample listings.", error);
  console.log(count ? "✔ Removed the sample organization and all its listings." : "Nothing to remove.");
}

async function add() {
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .upsert(ORG, { onConflict: "slug" })
    .select("id")
    .single();
  if (orgError) fail("Couldn't create the sample organization. Did you run the database setup SQL?", orgError);

  const { data: districts, error: districtError } = await supabase.from("districts").select("id, slug");
  if (districtError) fail("Couldn't read districts.", districtError);
  const districtId = new Map(districts.map((d) => [d.slug, d.id]));

  const rows = LISTINGS.map(
    ([district, slug, title, description, listing, category, type, price, rentPeriod, address, beds, baths, area, furnished, featured, features, daysAgo]) => {
      if (!districtId.has(district)) fail(`Unknown district "${district}".`);
      return {
        organization_id: org.id,
        district_id: districtId.get(district),
        slug,
        title,
        description: description + SAMPLE_NOTE,
        listing_type: listing,
        category,
        property_type: type,
        status: "published",
        price,
        rent_period: rentPeriod,
        address,
        bedrooms: beds,
        bathrooms: baths,
        area_sqm: area,
        is_furnished: furnished,
        is_featured: featured,
        features,
        published_at: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
      };
    }
  );

  const { data, error } = await supabase.from("properties").upsert(rows, { onConflict: "slug" }).select("slug");
  if (error) fail("Couldn't save the listings.", error);

  console.log(`✔ ${data.length} sample listings are live under "${ORG.name}".`);
  console.log("  Remove them before launch with: npm run samples:remove");
}

if (mode === "remove") await remove();
else if (mode === "add") await add();
else fail('Usage: node scripts/sample-listings.mjs add|remove');
