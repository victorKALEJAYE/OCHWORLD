"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/** Enquiry inbox actions. Only `status` is updatable, by the organization (column grant + RLS). */

const uuid = z.string().uuid();

export async function updateEnquiryStatus(formData: FormData): Promise<void> {
  const id = uuid.safeParse(formData.get("enquiryId"));
  const status = z.enum(["new", "responded", "closed"]).safeParse(formData.get("status"));
  if (!id.success || !status.success) return;

  const supabase = await createClient();
  const { error } = await supabase.from("enquiries").update({ status: status.data }).eq("id", id.data);
  if (error) console.error("updateEnquiryStatus failed", error);
  revalidatePath("/dashboard", "layout");
}
