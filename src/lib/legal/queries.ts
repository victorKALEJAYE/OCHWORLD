import { cache } from "react";
import { DataLoadError } from "@/lib/errors";
import { legalPhoto } from "@/config/photos";
import { LEGACY_SERVICE_LABELS } from "@/lib/legal/constants";
import type { Enums, LegalServiceIcon } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type LegalServiceSummary = {
  id: string;
  slug: string;
  title: string;
  icon: LegalServiceIcon;
  summary: string;
  /** Uploaded by the team, else the bundled default photo; undefined if neither. */
  imageUrl?: string;
};

type ServiceRow = { id: string; slug: string; title: string; icon: LegalServiceIcon; summary: string; image_url: string | null };

function withImage<T extends ServiceRow>({ image_url, ...row }: T) {
  return { ...row, imageUrl: image_url ?? legalPhoto(row.slug) };
}

export type LegalServiceDetail = LegalServiceSummary & {
  description: string;
  covers: string[];
  reasons: string[];
};

/**
 * Published services in the team's chosen order. Never throws: if the
 * catalogue can't load, sections that show it are simply left out.
 */
export const getLegalServices = cache(async (): Promise<LegalServiceSummary[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("legal_services")
    .select("id, slug, title, icon, summary, image_url")
    .eq("is_published", true)
    .order("position")
    .order("title");
  if (error) {
    console.error(new DataLoadError("legal services", error));
    return [];
  }
  return data.map(withImage);
});

/** One published service by its slug, or null. */
export const getLegalService = cache(async (slug: string): Promise<LegalServiceDetail | null> => {
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("legal_services")
    .select("id, slug, title, icon, summary, description, covers, reasons, image_url")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new DataLoadError("this legal service", error);
  return data ? withImage(data) : null;
});

export type LegalRequestSummary = {
  id: string;
  serviceTitle: string;
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
    .select(
      "id, service, status, property_details, created_at, catalogue:legal_services(title), property:properties(title, slug)"
    )
    .eq("requester_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new DataLoadError("your legal requests", error);
  type Row = {
    id: string;
    service: Enums<"legal_service"> | null;
    status: Enums<"legal_request_status">;
    property_details: string | null;
    created_at: string;
    catalogue: { title: string } | null;
    property: { title: string; slug: string } | null;
  };
  return (data as unknown as Row[]).map((r) => ({
    id: r.id,
    serviceTitle: r.catalogue?.title ?? (r.service ? LEGACY_SERVICE_LABELS[r.service] : "Legal help"),
    status: r.status,
    property: r.property,
    propertyDetails: r.property_details ?? undefined,
    createdAt: r.created_at,
  }));
}
