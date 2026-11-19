/**
 * View-model for property cards and lists.
 *
 * This is what UI components receive, not the database row. In Phase 3 a
 * mapper (`toPropertyCard(row)`) will build it from the Supabase `properties`
 * table, so UI stays stable if the schema changes.
 */
export type ListingType = "sale" | "rent";
export type RentPeriod = "year" | "month";

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
  /** Floor area in square metres. */
  areaSqm?: number;
  /** Public image URL (Supabase Storage). Omit to show the placeholder. */
  imageUrl?: string;
  isFeatured?: boolean;
};
