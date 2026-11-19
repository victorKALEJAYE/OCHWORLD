import type { Enums } from "@/lib/supabase/database.types";

/**
 * View-models for the UI.
 *
 * Components receive these, not database rows. `mappers.ts` builds them from
 * Supabase results, so the UI stays stable if the schema changes.
 */
export type ListingType = Enums<"listing_type">;
export type RentPeriod = Enums<"rent_period">;
export type PropertyCategory = Enums<"property_category">;
export type PropertyType = Enums<"property_type">;
export type OrganizationType = Enums<"organization_type">;

export type PropertyCardData = {
  id: string;
  /** URL segment for /properties/[slug]. */
  slug: string;
  title: string;
  listingType: ListingType;
  /** Whole naira. */
  price: number;
  /** Only for rentals. Abuja rents are usually quoted per year. */
  rentPeriod?: RentPeriod;
  /** Abuja district, e.g. "Maitama". */
  district: string;
  bedrooms?: number;
  bathrooms?: number;
  /** Floor area (or plot size for land) in square metres. */
  areaSqm?: number;
  /** Public image URL. Omit to show the placeholder. */
  imageUrl?: string;
  isFeatured?: boolean;
};

export type PropertyImage = { url: string; alt: string };

export type ListingOrganization = {
  id: string;
  name: string;
  slug: string;
  type: OrganizationType;
  /** Business phone; never set for private landlords. */
  phone?: string;
};

export type PropertyDetail = PropertyCardData & {
  description?: string;
  category: PropertyCategory;
  propertyType: PropertyType;
  districtSlug: string;
  address?: string;
  isFurnished: boolean;
  features: string[];
  publishedAt?: string;
  images: PropertyImage[];
  organization: ListingOrganization;
};

export type DistrictSummary = {
  name: string;
  slug: string;
  listingCount: number;
};

export type OrganizationSummary = Omit<ListingOrganization, "id" | "phone"> & {
  about?: string;
};
