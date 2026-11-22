import generated from "@/config/photos.generated.json";

/**
 * Site photos (homepage hero, district cards). The files live in public/images
 * and are listed in photos.generated.json, which `npm run photos:site` writes.
 * Anything not listed falls back to the photo-free design, so a missing photo
 * never shows as a broken image.
 *
 * To use your own photo of a district, save it as
 * public/images/districts/<district-slug>.jpg and add it to the JSON.
 */
type PhotoManifest = {
  hero: string | null;
  heroVideo?: string | null;
  explore?: string | null;
  exploreVideo?: string | null;
  districts: Record<string, string>;
  legal?: Record<string, string>;
};

const photos = generated as PhotoManifest;

export const heroPhoto: string | null = photos.hero;

/** Optional background video for the homepage hero (`npm run media:hero-video -- <file>`). */
export const heroVideo: string | null = photos.heroVideo ?? null;

/**
 * Explore Abuja background (e.g. the City Gate): `npm run media:explore -- <photo>`
 * and/or `npm run media:explore-video -- <video>`. Falls back to the homepage photo.
 */
export const explorePhoto: string | null = photos.explore ?? photos.hero;
export const exploreVideo: string | null = photos.exploreVideo ?? null;

export function districtPhoto(slug: string): string | undefined {
  return photos.districts[slug];
}

/** Default photo for a legal service (`npm run photos:legal`), used when the team hasn't uploaded one. */
export function legalPhoto(slug: string): string | undefined {
  return photos.legal?.[slug];
}
