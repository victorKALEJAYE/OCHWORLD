import type { OrganizationType, PropertyCategory, PropertyType } from "@/lib/properties/types";

export const PAGE_SIZE = 12;

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "Apartment",
  duplex: "Duplex",
  detached_house: "Detached house",
  semi_detached_house: "Semi-detached house",
  terrace: "Terrace",
  bungalow: "Bungalow",
  penthouse: "Penthouse",
  land: "Land",
  office: "Office",
  shop: "Shop",
  warehouse: "Warehouse",
};

export const CATEGORY_LABELS: Record<PropertyCategory, string> = {
  residential: "Residential",
  commercial: "Commercial",
  land: "Land",
};

export const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  agency: "Estate agency",
  landlord: "Landlord",
  developer: "Developer",
};

/**
 * Price steps for filters. Sale prices are totals; rent prices are per year,
 * which is how Abuja rents are advertised.
 */
export const SALE_PRICE_STEPS = [20_000_000, 50_000_000, 100_000_000, 200_000_000, 500_000_000, 1_000_000_000];
export const RENT_PRICE_STEPS = [1_000_000, 2_500_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000];

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];
