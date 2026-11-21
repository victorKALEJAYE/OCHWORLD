import { CARD_COLUMNS, toPropertyCard } from "@/lib/properties/mappers";
import { DataLoadError } from "@/lib/properties/queries";
import type { PropertyCardData } from "@/lib/properties/types";
import type { Enums } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

/**
 * Dashboard queries. They don't filter by "my" ids for security: RLS already
 * limits every row to what the signed-in user may see. Filters here only pick
 * which of those rows a given panel shows.
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

export type OrganizationStats = {
  published: number;
  drafts: number;
  newEnquiries: number;
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

/** Listings this user saved, newest first. Listings unpublished since are left out by RLS. */
export async function getSavedProperties(limit = 6): Promise<PropertyCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_properties")
    .select(`created_at, property:properties(${CARD_COLUMNS})`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new DataLoadError("saved properties", error);
  return data.flatMap((row) => (row.property ? [toPropertyCard(row.property)] : []));
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

/** Headline counts for an organization's dashboard card. */
export async function getOrganizationStats(organizationId: string): Promise<OrganizationStats> {
  const supabase = await createClient();
  const count = (q: PromiseLike<{ count: number | null; error: unknown }>) =>
    Promise.resolve(q).then(({ count, error }) => {
      if (error) throw new DataLoadError("organization stats", error);
      return count ?? 0;
    });

  const [published, drafts, newEnquiries] = await Promise.all([
    count(
      supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "published")
    ),
    count(
      supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "draft")
    ),
    count(
      supabase
        .from("enquiries")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("status", "new")
    ),
  ]);
  return { published, drafts, newEnquiries };
}
