#!/usr/bin/env node
/**
 * Adds photos to the site from Unsplash (free to use, commercial included:
 * https://unsplash.com/license). Runs on your computer, which downloads them.
 *
 *   npm run photos:site        homepage hero + district photos → public/images/
 *                              (commit and push these; no keys needed)
 *   npm run photos:samples     photos for the 10 sample listings → Supabase Storage
 *                              (needs SUPABASE_SECRET_KEY in .env.local; skips
 *                              listings that already have photos, unless --replace)
 *
 * The district photos are general Abuja photos, not verified pictures of each
 * district. Replace any of them with your own photo of the area: put a JPG at
 * public/images/districts/<district-slug>.jpg (the file names stay the same).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const UA = "OCHWORLD-setup-script/1.0";

/** Downloads an Unsplash photo by its id (the last part of its page URL), resized to `width`. */
async function download(id, width) {
  const res = await fetch(`https://unsplash.com/photos/${id}/download?force=true&w=${width}`, {
    headers: { "User-Agent": UA },
    redirect: "follow",
  });
  const type = res.headers.get("content-type") ?? "";
  if (!res.ok || !type.startsWith("image/")) throw new Error(`HTTP ${res.status} ${type || "no type"}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length > 4.5 * 1024 * 1024) throw new Error(`too large (${(buffer.length / 1e6).toFixed(1)} MB)`);
  return buffer;
}

/** First candidate that downloads successfully (some photos are premium or removed). */
async function firstWorking(ids, width, label) {
  for (const id of ids) {
    try {
      const buffer = await download(id, width);
      return { id, buffer };
    } catch (error) {
      console.log(`  · ${label}: ${id} unavailable (${error.message}), trying the next one`);
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Site photos (hero + districts)
// ---------------------------------------------------------------------------

/** Candidates in order of preference. All tagged "Abuja, Nigeria" on Unsplash. */
const HERO = ["q4U9Pyfz-vQ", "kaoZ0baYTXY", "d2hYqpR0YS0"];

const DISTRICTS = {
  "central-business-district": ["xRAewjeW0_I", "LfRn3yxsrQo"],
  "wuse-ii": ["LfRn3yxsrQo", "q_SmDVuA8h0"],
  utako: ["q_SmDVuA8h0", "7SvNr79AvvE"],
  maitama: ["MxDF3-ysw_g", "kaoZ0baYTXY"],
  asokoro: ["kaoZ0baYTXY", "MxDF3-ysw_g"],
  jabi: ["IW_edtdqcVo", "B-pK0xq3mGw"],
  gwarinpa: ["hzx5kpvmgco", "q4U9Pyfz-vQ"],
  katampe: ["Qe9S79-5iD0", "UwoCLYgejB0"],
  guzape: ["UwoCLYgejB0", "Qe9S79-5iD0"],
  lokogoma: ["7SvNr79AvvE", "hzx5kpvmgco"],
  garki: ["mqzmjt_4T1w", "LfRn3yxsrQo"],
};

async function sitePhotos() {
  mkdirSync("public/images/districts", { recursive: true });
  const manifest = { hero: null, districts: {} };

  console.log("Homepage hero…");
  const hero = await firstWorking(HERO, 1920, "hero");
  if (hero) {
    writeFileSync("public/images/hero.jpg", hero.buffer);
    manifest.hero = "/images/hero.jpg";
    console.log(`  ✔ hero (${hero.id})`);
  }

  for (const [slug, ids] of Object.entries(DISTRICTS)) {
    const photo = await firstWorking(ids, 900, slug);
    if (!photo) continue;
    writeFileSync(`public/images/districts/${slug}.jpg`, photo.buffer);
    manifest.districts[slug] = `/images/districts/${slug}.jpg`;
    console.log(`  ✔ ${slug} (${photo.id})`);
  }

  writeFileSync("src/config/photos.generated.json", JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\n✔ Saved to public/images and src/config/photos.generated.json.`);
  console.log("  Check them with `npm run dev`, then commit and push.");
}

// ---------------------------------------------------------------------------
// Sample listing photos (Supabase Storage)
// ---------------------------------------------------------------------------

/** Per sample listing: candidate photo ids, exterior first (the first one becomes the cover). */
const LISTING_PHOTOS = {
  "sample-5-bed-detached-duplex-maitama": ["2d4lAQAlbDA", "eWOgoFHlE8g", "y8j0gmhtS-4", "MP0bgaS_d1c", "FqqiAvJejto", "OtXADkUh3-I"],
  "sample-6-bed-mansion-asokoro": ["d2hYqpR0YS0", "-etw_RV6saw", "OtXADkUh3-I", "5h_LuBDilto", "QhOWAMiWvVs", "b6Bs19onFtY"],
  "sample-3-bed-serviced-apartment-wuse-ii": ["mR1CIDduGLc", "nmKPgfIUYtM", "1M9iX5E97rw", "gREquCUXQLI", "J5Yo2BjqKZ0"],
  "sample-2-bed-apartment-jabi": ["RFDP7_80v5A", "L-ElUSrO9nA", "2dnjAACDNd8", "r8i3RwrVcRk", "rEJxpBskj3Q"],
  "sample-4-bed-terrace-gwarinpa": ["3ddHcjHmiGw", "tHkJAMcO3QE", "2fJB9gwnA6U", "808a4AWu8jE", "E0pZm6b2z7A"],
  "sample-4-bed-semi-detached-katampe": ["URD4NdWyd60", "hHz4yrvxwlA", "b6Bs19onFtY", "AB-q9lwCVv8", "uz6wuNKA60Q"],
  "sample-office-floor-cbd": ["aToaXLqCudk", "K9DZz7B8sCU", "DeDWCcLUHSs", "Ww5jTiOCcug"],
  "sample-shop-utako": ["tR7PZ5S_sm4", "jr9f8smBXpI", "_mNo5MSXsLY", "7vGOt_hKU14"],
  "sample-land-plot-guzape": ["XZqORQbIp6g", "ZOns16lPDo8", "HDRA1Td0EUc", "dqfFdtkp6lI"],
  "sample-3-bed-bungalow-lokogoma": ["4ojhpgKpS68", "_TPTXZd9mOo", "3wylDrjxH-E", "aeTexYQKsuk", "WPuwLGQCxng"],
};
const PHOTOS_PER_LISTING = 4;
const BUCKET = "property-images";

async function samplePhotos() {
  const { createClient } = await import("@supabase/supabase-js");
  const { checkTarget } = await import("./lib/target.mjs");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret || secret.startsWith("PASTE") || secret.startsWith("sb_publishable_")) {
    console.error("✖ Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (sb_secret_...) in .env.local.");
    process.exit(1);
  }
  checkTarget(url);
  const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const replace = process.argv.includes("--replace");

  const { data: listings, error } = await supabase
    .from("properties")
    .select("id, slug, title, organization_id, property_images(id, storage_path)")
    .in("slug", Object.keys(LISTING_PHOTOS));
  if (error) {
    console.error("✖ Couldn't read the sample listings.", error.message);
    process.exit(1);
  }
  if (!listings.length) {
    console.error("✖ No sample listings found. Run `npm run samples:add` first.");
    process.exit(1);
  }

  let added = 0;
  for (const listing of listings) {
    if (listing.property_images.length > 0) {
      if (!replace) {
        console.log(`• ${listing.slug}: already has photos (use --replace to redo)`);
        continue;
      }
      const paths = listing.property_images.map((p) => p.storage_path).filter(Boolean);
      if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
      await supabase.from("property_images").delete().eq("property_id", listing.id);
    }

    console.log(`• ${listing.slug}`);
    let position = 0;
    for (const id of LISTING_PHOTOS[listing.slug]) {
      if (position >= PHOTOS_PER_LISTING) break;
      let buffer;
      try {
        buffer = await download(id, 1600);
      } catch (e) {
        console.log(`  · ${id} unavailable (${e.message}), skipping`);
        continue;
      }
      const path = `${listing.organization_id}/${listing.id}/${randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
      if (uploadError) {
        console.log(`  · upload failed: ${uploadError.message}`);
        continue;
      }
      const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      const { error: rowError } = await supabase
        .from("property_images")
        .insert({ property_id: listing.id, url: publicUrl, storage_path: path, alt: listing.title, position });
      if (rowError) {
        console.log(`  · couldn't record photo: ${rowError.message}`);
        await supabase.storage.from(BUCKET).remove([path]);
        continue;
      }
      position++;
      added++;
    }
    console.log(`  ✔ ${position} photo${position === 1 ? "" : "s"}`);
  }
  console.log(`\n✔ Added ${added} photos. Refresh the site to see them.`);
}

const mode = process.argv[2];
if (mode === "site") await sitePhotos();
else if (mode === "samples") await samplePhotos();
else {
  console.error("Usage: node scripts/photos.mjs site|samples [--replace] [--production]");
  process.exit(1);
}
