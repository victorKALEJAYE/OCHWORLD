"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { enquirySchema } from "@/lib/validations/enquiry";

export type EnquiryState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<string, string>> };

/**
 * Sends an enquiry about a published listing. Guests and signed-in users can
 * both enquire. The database trigger fills the organization and sender, and
 * RLS rejects enquiries on unpublished listings.
 */
export async function sendEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  // Honeypot: real visitors never see or fill this field.
  if (formData.get("company")) return { status: "success" };

  const parsed = enquirySchema.safeParse({
    propertyId: formData.get("propertyId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    message: formData.get("message"),
  });

  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0]])
    );
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const { propertyId, name, email, phone, message } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("enquiries")
    .insert({ property_id: propertyId, name, email, phone: phone || null, message });

  if (error) {
    console.error("sendEnquiry failed", error);
    return { status: "error", message: "We couldn't send your message. Please try again in a moment." };
  }
  return { status: "success" };
}

/**
 * Saves or un-saves a listing for the signed-in user. Visitors who aren't
 * signed in are sent to sign in and brought back to the listing afterwards.
 */
export async function toggleSavedProperty(formData: FormData) {
  const input = z
    .object({ propertyId: z.string().uuid(), slug: z.string().min(1).max(120), saved: z.enum(["true", "false"]) })
    .safeParse(Object.fromEntries(formData));
  if (!input.success) return;

  const { propertyId, slug, saved } = input.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(`/properties/${slug}`)}`);

  const result =
    saved === "true"
      ? await supabase.from("saved_properties").delete().eq("property_id", propertyId)
      : await supabase.from("saved_properties").insert({ property_id: propertyId });

  // 23505 = already saved (double click); treat as success.
  if (result.error && result.error.code !== "23505") console.error("toggleSavedProperty failed", result.error);

  revalidatePath(`/properties/${slug}`);
}
