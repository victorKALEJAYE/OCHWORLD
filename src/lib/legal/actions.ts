"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { legalRequestSchema } from "@/lib/validations/legal";

export type LegalRequestState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<string, string>> };

/**
 * Records a request for property legal help. Guests and signed-in users can
 * both send one; the database sets the requester and status, and RLS only
 * accepts links to published listings.
 */
export async function requestLegalHelp(_prev: LegalRequestState, formData: FormData): Promise<LegalRequestState> {
  // Honeypot: real visitors never see or fill this field.
  if (formData.get("company")) return { status: "success" };

  const text = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" && v.trim() ? v : undefined;
  };
  const parsed = legalRequestSchema.safeParse({
    serviceSlug: text("service"),
    propertyId: text("propertyId"),
    propertyDetails: text("propertyDetails"),
    name: text("name"),
    email: text("email"),
    phone: text("phone"),
    message: text("message"),
  });
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0]])
    );
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const v = parsed.data;
  const supabase = await createClient();
  const { data: service } = await supabase
    .from("legal_services")
    .select("id")
    .eq("slug", v.serviceSlug)
    .eq("is_published", true)
    .maybeSingle();
  if (!service) {
    return { status: "error", message: "Please choose a service.", fieldErrors: { serviceSlug: "Choose a service" } };
  }
  // No .select() afterwards: guests may create a request but not read it back.
  const { error } = await supabase.from("legal_requests").insert({
    service_id: service.id,
    property_id: v.propertyId ?? null,
    property_details: v.propertyDetails ?? null,
    name: v.name,
    email: v.email,
    phone: v.phone,
    message: v.message ?? null,
  });
  if (error) {
    console.error("requestLegalHelp failed", error);
    return { status: "error", message: "We couldn't send your request. Please try again in a moment." };
  }
  revalidatePath("/dashboard");
  return { status: "success" };
}
