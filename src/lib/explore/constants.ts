import type { Enums } from "@/lib/supabase/database.types";

export type RatingCategory = Enums<"district_rating_category">;

/** Rating categories shown on district pages, in display order. 5 is always "best". */
export const RATING_CATEGORIES: { value: RatingCategory; label: string; help: string }[] = [
  { value: "security", label: "Security", help: "Safety of the area day and night; estate and street security" },
  { value: "road_access", label: "Road accessibility", help: "Condition of roads and how easy it is to get in and out" },
  { value: "electricity", label: "Electricity", help: "How many hours of grid power the area usually gets" },
  { value: "infrastructure", label: "Infrastructure & social amenities", help: "Water, drainage, schools, hospitals and shops nearby" },
  { value: "lifestyle", label: "Lifestyle", help: "Restaurants, parks, leisure and the feel of the neighbourhood" },
  { value: "flood_safety", label: "Flood safety", help: "5 means little or no flooding risk" },
  { value: "traffic_flow", label: "Traffic flow", help: "5 means traffic moves freely at rush hour" },
];

/** Average of the scored categories, to one decimal place; null if none are scored. */
export function overallScore(scores: Partial<Record<RatingCategory, number>>): number | null {
  const values = Object.values(scores).filter((v): v is number => typeof v === "number");
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}
