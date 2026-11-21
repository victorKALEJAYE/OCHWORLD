import { DataLoadError } from "@/lib/errors";
import type { Enums } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

/**
 * Enquiries: the organization's inbox and what a user has sent. RLS limits
 * rows to the organization's members and to the sender.
 */

export type EnquirySummary = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: Enums<"enquiry_status">;
  createdAt: string;
  property: { title: string; slug: string } | null;
};

const ENQUIRY_COLUMNS = "id, name, email, phone, message, status, created_at, property:properties(title, slug)";

type EnquiryRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: Enums<"enquiry_status">;
  created_at: string;
  property: { title: string; slug: string } | null;
};

function toEnquirySummary(row: EnquiryRow): EnquirySummary {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    property: row.property,
  };
}

/** Enquiries this user has sent. */
export async function getSentEnquiries(userId: string, limit = 5): Promise<EnquirySummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enquiries")
    .select(ENQUIRY_COLUMNS)
    .eq("sender_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new DataLoadError("your enquiries", error);
  return data.map(toEnquirySummary);
}

/** Latest enquiries received by an organization. */
export async function getOrganizationEnquiries(
  organizationId: string,
  limit = 5,
  status?: Enums<"enquiry_status">
): Promise<EnquirySummary[]> {
  const supabase = await createClient();
  let query = supabase.from("enquiries").select(ENQUIRY_COLUMNS).eq("organization_id", organizationId);
  if (status) query = query.eq("status", status);
  const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
  if (error) throw new DataLoadError("enquiries", error);
  return data.map(toEnquirySummary);
}
