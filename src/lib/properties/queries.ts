import { cache } from "react";
import { PAGE_SIZE } from "@/lib/properties/constants";
import type { PropertyFilters } from "@/lib/properties/filters";
import {
  CARD_COLUMNS,
  DETAIL_COLUMNS,
  toDistrictSummary,
  toOrganizationSummary,
  toPropertyCard,
  toPropertyDetail,
} from "@/lib/properties/mappers";
import type { DistrictSummary, OrganizationSummary, PropertyCardData, PropertyDetail } from "@/lib/properties/types";
import { getViewer } from "@/lib/auth/viewer";
import { createClient } from "@/lib/supabase/server";

/**
 * Read-only queries for the public marketplace. Server-side only.
 *
 * Every query runs with the visitor's own session (anon or signed in), so the
 * database's RLS policies decide what is visible: only published listings.
 * The explicit `status = published` filters below are for index use and
 * clarity, not security.
 */

export class DataLoadError extends Error {
  constructor(what: string, cause: unknown) {
    super(`Couldn't load ${what}`, { cause });
    this.name = "DataLoadError";
  }
}

export type SearchResult = {
  items: PropertyCardData[];
  total: number;
  page: number;
  pageCount: number;
};

/** Districts with their published-listing counts. Cached per request. */
export const getDistricts = cache(async (): Promise<DistrictSummary[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("district_listing_counts")
    .select("id, name, slug, listing_count")
    .order("name");
  if (error) throw new DataLoadError("districts", error);
  return data.map(toDistrictSummary);
});

/** All organizations (agencies, landlords, developers), alphabetical. */
export const getOrganizations = cache(async (): Promise<OrganizationSummary[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("name, slug, type, about")
    .order("name");
  if (error) throw new DataLoadError("agents", error);
  return data.map(toOrganizationSummary);
});

/** Featured listings first, then the newest. Used on the homepage. */
export async function getFeaturedProperties(limit = 6): Promise<PropertyCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .order("position", { referencedTable: "property_images" })
    .limit(1, { referencedTable: "property_images" })
    .limit(limit);
  if (error) throw new DataLoadError("featured properties", error);
  return data.map(toPropertyCard);
}

/** Filtered, sorted, paginated search for /properties. */
export async function searchProperties(filters: PropertyFilters): Promise<SearchResult> {
  const supabase = await createClient();
  const empty: SearchResult = { items: [], total: 0, page: filters.page, pageCount: 0 };

  // Filters arrive as slugs (readable URLs); the table stores ids.
  const [districtId, organizationId] = await Promise.all([
    filters.district ? idForSlug("districts", filters.district) : undefined,
    filters.agency ? idForSlug("organizations", filters.agency) : undefined,
  ]);
  if (districtId === null || organizationId === null) return empty; // unknown slug: nothing matches

  let query = supabase.from("properties").select(CARD_COLUMNS, { count: "exact" }).eq("status", "published");

  if (filters.listing) query = query.eq("listing_type", filters.listing);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.type) query = query.eq("property_type", filters.type);
  if (districtId !== undefined) query = query.eq("district_id", districtId);
  if (organizationId !== undefined) query = query.eq("organization_id", organizationId);
  if (filters.minPrice) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
  if (filters.beds) query = query.gte("bedrooms", filters.beds);

  query =
    filters.sort === "price_asc"
      ? query.order("price", { ascending: true })
      : filters.sort === "price_desc"
        ? query.order("price", { ascending: false })
        : query.order("published_at", { ascending: false });

  const from = (filters.page - 1) * PAGE_SIZE;
  const { data, error, count } = await query
    .order("id") // tie-breaker so pages don't overlap
    .order("position", { referencedTable: "property_images" })
    .limit(1, { referencedTable: "property_images" })
    .range(from, from + PAGE_SIZE - 1);

  // PGRST103: the requested page is past the last result (e.g. an old shared link).
  if (error?.code === "PGRST103") return empty;
  if (error) throw new DataLoadError("properties", error);

  const total = count ?? 0;
  return {
    items: data.map(toPropertyCard),
    total,
    page: filters.page,
    pageCount: Math.ceil(total / PAGE_SIZE),
  };
}

/** A published listing with photos and its organization, or null. */
export const getPropertyBySlug = cache(async (slug: string): Promise<(PropertyDetail & { id: string }) | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(DETAIL_COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .order("position", { referencedTable: "property_images" })
    .maybeSingle();
  if (error) throw new DataLoadError("this property", error);
  if (!data) return null;

  const property = toPropertyDetail(data);
  // Contact columns aren't publicly readable on `organizations`; the
  // `organization_contacts` view returns business numbers only (never landlords').
  if (property.organization.id) {
    const { data: contact } = await supabase
      .from("organization_contacts")
      .select("phone")
      .eq("id", property.organization.id)
      .maybeSingle();
    property.organization.phone = contact?.phone ?? undefined;
  }
  return property;
});

/** Other published listings in the same district, excluding the current one. */
export async function getSimilarProperties(districtSlug: string, excludeId: string, limit = 3) {
  const districtId = await idForSlug("districts", districtSlug);
  if (!districtId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(CARD_COLUMNS)
    .eq("status", "published")
    .eq("district_id", districtId)
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .order("position", { referencedTable: "property_images" })
    .limit(1, { referencedTable: "property_images" })
    .limit(limit);
  if (error) throw new DataLoadError("similar properties", error);
  return data.map(toPropertyCard);
}

/**
 * Which of these listings the signed-in user has favourited. Empty for guests.
 * One query per page of cards; RLS limits it to the user's own rows. Failure
 * is non-fatal: hearts just start empty.
 */
export async function getFavouriteIds(propertyIds: string[]): Promise<Set<string>> {
  if (propertyIds.length === 0 || !(await getViewer())) return new Set();
  const supabase = await createClient();
  const { data, error } = await supabase.from("saved_properties").select("property_id").in("property_id", propertyIds);
  if (error) {
    console.error(error);
    return new Set();
  }
  return new Set(data.map((row) => row.property_id));
}

/** Whether the signed-in user has saved this property (RLS limits the check to their own rows). */
export async function isPropertySaved(propertyId: string): Promise<boolean> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("saved_properties")
    .select("property_id", { count: "exact", head: true })
    .eq("property_id", propertyId);
  if (error) throw new DataLoadError("saved state", error);
  return (count ?? 0) > 0;
}

/** Resolves a slug to its id. undefined = no filter, null = unknown slug. */
async function idForSlug(table: "districts", slug: string): Promise<number | null>;
async function idForSlug(table: "organizations", slug: string): Promise<string | null>;
async function idForSlug(table: "districts" | "organizations", slug: string): Promise<number | string | null> {
  const supabase = await createClient();
  // Two literal queries (rather than .from(table)) keep the result types precise.
  const { data, error } =
    table === "districts"
      ? await supabase.from("districts").select("id").eq("slug", slug).maybeSingle()
      : await supabase.from("organizations").select("id").eq("slug", slug).maybeSingle();
  if (error) throw new DataLoadError(table, error);
  return data?.id ?? null;
}
