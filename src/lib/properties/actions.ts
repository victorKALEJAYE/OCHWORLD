"use server";

import { revalidatePath } from "next/cache";
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

export type FavouriteResult = { status: "ok" } | { status: "signed-out" } | { status: "error" };

/**
 * Adds or removes a listing from the signed-in user's favourites
 * (`saved_properties`). Called from the heart button on cards and property
 * pages. Signed-out visitors get `signed-out` back and the button sends them to
 * sign in, returning to the same page afterwards.
 *
 * RLS limits every change to the user's own rows and to published listings.
 */
export async function setFavourite(propertyId: string, favourite: boolean): Promise<FavouriteResult> {
  if (!z.string().uuid().safeParse(propertyId).success) return { status: "error" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "signed-out" };

  const { error } = favourite
    ? await supabase.from("saved_properties").insert({ property_id: propertyId })
    : await supabase.from("saved_properties").delete().eq("property_id", propertyId);

  // 23505 = already a favourite (double tap): the outcome the user wanted.
  if (error && error.code !== "23505") {
    console.error("setFavourite failed", error);
    return { status: "error" };
  }

  revalidatePath("/dashboard");
  return { status: "ok" };
}
