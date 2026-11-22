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

/** Example signed-in user for the header and account menu. */
export const designReviewAccount = {
  name: "Adaeze Okafor",
  email: "adaeze@example.com",
  initials: "AO",
  onboarded: true,
  isPlatformAdmin: false,
  organizations: [{ id: "example-org", name: "Example Realty", role: "owner" as const }],
};

export const designReviewLegalServices = [
  { id: "1", slug: "property-due-diligence", title: "Property Due Diligence", icon: "file-search" as const, summary: "Find out everything about a property, its seller and its papers before you commit any money." },
  { id: "2", slug: "documentation", title: "Documentation", icon: "file-text" as const, summary: "Have the right contracts and deeds drafted or reviewed, so every deal is properly written down." },
  { id: "3", slug: "tenancy-matters", title: "Tenancy Matters", icon: "key" as const, summary: "Tenancy agreements, rent disputes and recovering possession, handled properly." },
];

export const designReviewRatings = {
  security: { score: 4, note: "Example note shown publicly", updatedAt: "2026-11-01T00:00:00Z" },
  road_access: { score: 5, updatedAt: "2026-11-01T00:00:00Z" },
  flood_safety: { score: 3, updatedAt: "2026-11-01T00:00:00Z" },
};
