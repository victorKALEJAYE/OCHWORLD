"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { RATING_CATEGORIES } from "@/lib/explore/constants";
import { createClient } from "@/lib/supabase/server";

export type RatingsFormState = { status: "idle" } | { status: "saved" } | { status: "error"; message: string };

/**
 * Saves the OCHWORLD team's scores for one district. Platform admins only
 * (enforced by RLS). An empty score removes that category's rating.
 */
export async function saveDistrictRatings(_prev: RatingsFormState, formData: FormData): Promise<RatingsFormState> {
  const districtId = z.coerce.number().int().positive().safeParse(formData.get("districtId"));
  const slug = z.string().regex(/^[a-z0-9-]+$/).safeParse(formData.get("slug"));
  if (!districtId.success || !slug.success) return { status: "error", message: "Unknown district." };

  const upserts: { district_id: number; category: (typeof RATING_CATEGORIES)[number]["value"]; score: number; note: string | null }[] = [];
  const removals: (typeof RATING_CATEGORIES)[number]["value"][] = [];
  for (const { value } of RATING_CATEGORIES) {
    const raw = formData.get(`score_${value}`);
    const note = String(formData.get(`note_${value}`) ?? "").trim().slice(0, 300);
    if (!raw) {
      removals.push(value);
      continue;
    }
    const score = z.coerce.number().int().min(1).max(5).safeParse(raw);
    if (!score.success) return { status: "error", message: "Scores must be from 1 to 5." };
    upserts.push({ district_id: districtId.data, category: value, score: score.data, note: note || null });
  }

  const supabase = await createClient();
  if (upserts.length) {
    const { error } = await supabase.from("district_ratings").upsert(upserts, { onConflict: "district_id,category" });
    if (error) {
      console.error("saveDistrictRatings failed", error);
      return { status: "error", message: error.code === "42501" ? "Only the OCHWORLD team can rate districts." : "Couldn't save the ratings." };
    }
  }
  if (removals.length) {
    const { error } = await supabase
      .from("district_ratings")
      .delete()
      .eq("district_id", districtId.data)
      .in("category", removals);
    if (error) console.error("saveDistrictRatings: removal failed", error);
  }
  revalidatePath(`/areas/${slug.data}`);
  return { status: "saved" };
}
