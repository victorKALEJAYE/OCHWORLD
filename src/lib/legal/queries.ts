import { DataLoadError } from "@/lib/errors";
import type { LegalService } from "@/lib/legal/constants";
import type { Enums } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type LegalRequestSummary = {
  id: string;
  service: LegalService;
  status: Enums<"legal_request_status">;
  property: { title: string; slug: string } | null;
  propertyDetails?: string;
  createdAt: string;
};

/** The signed-in user's own legal requests (RLS limits rows to theirs). */
export async function getMyLegalRequests(userId: string, limit = 10): Promise<LegalRequestSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("legal_requests")
    .select("id, service, status, property_details, created_at, property:properties(title, slug)")
    .eq("requester_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new DataLoadError("your legal requests", error);
  type Row = {
    id: string;
    service: LegalService;
    status: Enums<"legal_request_status">;
    property_details: string | null;
    created_at: string;
    property: { title: string; slug: string } | null;
  };
  return (data as unknown as Row[]).map((r) => ({
    id: r.id,
    service: r.service,
    status: r.status,
    property: r.property,
    propertyDetails: r.property_details ?? undefined,
    createdAt: r.created_at,
  }));
}
