import { cache } from "react";
import { DataLoadError } from "@/lib/errors";
import type { RatingCategory } from "@/lib/explore/constants";
import { createClient } from "@/lib/supabase/server";

export type DistrictRating = { score: number; note?: string; updatedAt: string };
export type DistrictRatings = Partial<Record<RatingCategory, DistrictRating>>;

/** A district by slug with its published-listing count, or null. */
export const getDistrict = cache(async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("district_listing_counts")
    .select("id, name, slug, listing_count")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new DataLoadError("this district", error);
  return data ? { id: data.id, name: data.name, slug: data.slug, listingCount: data.listing_count } : null;
});

/** The OCHWORLD team's scores for a district. Missing categories aren't rated yet. */
export async function getDistrictRatings(districtId: number): Promise<DistrictRatings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("district_ratings")
    .select("category, score, note, updated_at")
    .eq("district_id", districtId);
  // Ratings are extra information: if the table isn't there yet, show "not yet rated".
  if (error) {
    console.error(new DataLoadError("district ratings", error));
    return {};
  }
  return Object.fromEntries(
    data.map((r) => [r.category, { score: r.score, note: r.note ?? undefined, updatedAt: r.updated_at }])
  ) as DistrictRatings;
}
