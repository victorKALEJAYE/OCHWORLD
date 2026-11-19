import type { PropertyCardData } from "@/lib/properties/types";

/**
 * DESIGN REVIEW ONLY. Example values for showing the property card on
 * /design-system. Never import this from product pages: real listings come
 * from Supabase.
 */
export const designReviewProperties: PropertyCardData[] = [
  {
    id: "example-1",
    slug: "example-maitama-duplex",
    title: "5-bedroom detached duplex",
    listingType: "sale",
    price: 450_000_000,
    district: "Maitama",
    bedrooms: 5,
    bathrooms: 6,
    areaSqm: 620,
    isFeatured: true,
  },
  {
    id: "example-2",
    slug: "example-wuse-apartment",
    title: "3-bedroom serviced apartment",
    listingType: "rent",
    price: 9_500_000,
    rentPeriod: "year",
    district: "Wuse II",
    bedrooms: 3,
    bathrooms: 3,
    areaSqm: 180,
  },
  {
    id: "example-3",
    slug: "example-cbd-office",
    title: "Open-plan office floor",
    listingType: "rent",
    price: 32_000_000,
    rentPeriod: "year",
    district: "Central Business District",
    areaSqm: 450,
  },
];
