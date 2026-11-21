import { CARD_COLUMNS, toPropertyCard } from "@/lib/properties/mappers";
import { DataLoadError } from "@/lib/errors";
import type { PropertyCardData } from "@/lib/properties/types";
import { createClient } from "@/lib/supabase/server";

/**
 * Dashboard overview queries (favourites, organization stats). They don't
 * filter by "my" ids for security: RLS already limits every row to what the
 * signed-in user may see. Filters here only pick which rows a panel shows.
 */

export type OrganizationStats = {
  published: number;
  drafts: number;
  newEnquiries: number;
};

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
