import { redirect } from "next/navigation";
import type { Account, Membership } from "@/lib/auth/account";
import { DataLoadError } from "@/lib/properties/queries";
import type { ListingType, PropertyType, RentPeriod } from "@/lib/properties/types";
import type { Enums, Tables } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

/**
 * Queries for the agent/landlord dashboard. RLS limits every row to the
 * signed-in user's organizations, so these never see another tenant's data.
 */

export type ListingStatus = Enums<"listing_status">;

/** The organization a dashboard page is working on: `?org=<id>`, or the user's first. */
export function activeMembership(account: Account, orgParam?: string): Membership {
  const membership = account.memberships.find((m) => m.id === orgParam) ?? account.memberships[0];
  if (!membership) redirect("/dashboard");
  return membership;
}

export const canManageTeam = (m: Membership) => m.role === "owner" || m.role === "admin";
export const canDeleteListings = canManageTeam;

export type ManagedListing = {
  id: string;
  slug: string;
  title: string;
  status: ListingStatus;
  listingType: ListingType;
  price: number;
  rentPeriod?: RentPeriod;
  district: string;
  imageUrl?: string;
  isFeatured: boolean;
  updatedAt: string;
};

type ManagedRow = Pick<
  Tables<"properties">,
  "id" | "slug" | "title" | "status" | "listing_type" | "price" | "rent_period" | "is_featured" | "updated_at"
> & {
  district: { name: string } | null;
  property_images: { url: string; position: number }[];
};

/** All of an organization's listings (drafts, published, archived), recently edited first. */
export async function getManagedListings(organizationId: string, status?: ListingStatus): Promise<ManagedListing[]> {
  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select(
      "id, slug, title, status, listing_type, price, rent_period, is_featured, updated_at, district:districts(name), property_images(url, position)"
    )
    .eq("organization_id", organizationId);
  if (status) query = query.eq("status", status);

  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .order("position", { referencedTable: "property_images" })
    .limit(1, { referencedTable: "property_images" })
    .limit(200);
  if (error) throw new DataLoadError("your listings", error);

  return (data as unknown as ManagedRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    listingType: row.listing_type,
    price: row.price,
    rentPeriod: row.rent_period ?? undefined,
    district: row.district?.name ?? "",
    imageUrl: row.property_images[0]?.url,
    isFeatured: row.is_featured,
    updatedAt: row.updated_at,
  }));
}

export type ListingPhoto = { id: string; url: string; storagePath: string | null; position: number };

export type EditableListing = {
  id: string;
  organizationId: string;
  slug: string;
  status: ListingStatus;
  title: string;
  description: string;
  listingType: ListingType;
  propertyType: PropertyType;
  districtId: number;
  price: number;
  rentPeriod?: RentPeriod;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqm?: number;
  isFurnished: boolean;
  features: string[];
  photos: ListingPhoto[];
};

type EditableRow = Tables<"properties"> & {
  property_images: Pick<Tables<"property_images">, "id" | "url" | "storage_path" | "position">[];
};

/** A listing the user may edit, with its photos, or null (missing or another organization's). */
export async function getEditableListing(id: string): Promise<EditableListing | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(id, url, storage_path, position)")
    .eq("id", id)
    .order("position", { referencedTable: "property_images" })
    .maybeSingle();
  if (error) throw new DataLoadError("this listing", error);
  if (!data) return null;

  const row = data as unknown as EditableRow;
  return {
    id: row.id,
    organizationId: row.organization_id,
    slug: row.slug,
    status: row.status,
    title: row.title,
    description: row.description ?? "",
    listingType: row.listing_type,
    propertyType: row.property_type,
    districtId: row.district_id,
    price: row.price,
    rentPeriod: row.rent_period ?? undefined,
    address: row.address ?? "",
    bedrooms: row.bedrooms ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    areaSqm: row.area_sqm ?? undefined,
    isFurnished: row.is_furnished,
    features: row.features,
    photos: row.property_images.map((p) => ({
      id: p.id,
      url: p.url,
      storagePath: p.storage_path,
      position: p.position,
    })),
  };
}

export type DistrictOption = { id: number; name: string };

export async function getDistrictOptions(): Promise<DistrictOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("districts").select("id, name").order("name");
  if (error) throw new DataLoadError("districts", error);
  return data;
}

export type TeamMember = {
  userId: string;
  name: string;
  email?: string;
  role: Enums<"org_role">;
  joinedAt: string;
};

export type PendingInvitation = {
  id: string;
  email: string;
  role: Enums<"org_role">;
  token: string;
  expiresAt: string;
  expired: boolean;
};

export async function getTeam(organizationId: string): Promise<TeamMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("organization_team", { org: organizationId });
  if (error) throw new DataLoadError("your team", error);
  return (data ?? []).map((m) => ({
    userId: m.user_id,
    name: m.full_name || "Unnamed member",
    email: m.email ?? undefined,
    role: m.role,
    joinedAt: m.joined_at,
  }));
}

/** Open invitations. Only owners and admins can read them (RLS); others get an empty list. */
export async function getPendingInvitations(organizationId: string): Promise<PendingInvitation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_invitations")
    .select("id, email, role, token, expires_at")
    .eq("organization_id", organizationId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw new DataLoadError("invitations", error);
  const now = Date.now();
  return data.map((i) => ({
    id: i.id,
    email: i.email,
    role: i.role,
    token: i.token,
    expiresAt: i.expires_at,
    expired: new Date(i.expires_at).getTime() < now,
  }));
}
