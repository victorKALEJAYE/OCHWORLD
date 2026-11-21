import type { PropertyFilters } from "@/lib/properties/filters";
import type { DistrictSummary, PropertyType } from "@/lib/properties/types";

const PLURAL_TYPE: Record<PropertyType, string> = {
  apartment: "Apartments",
  duplex: "Duplexes",
  detached_house: "Detached houses",
  semi_detached_house: "Semi-detached houses",
  terrace: "Terraces",
  bungalow: "Bungalows",
  penthouse: "Penthouses",
  land: "Land",
  office: "Offices",
  shop: "Shops",
  warehouse: "Warehouses",
};

/**
 * Human heading for a search, e.g. "Apartments to rent in Wuse II".
 * Used as the page <h1> and <title>, which also helps search engines.
 */
export function describeSearch(filters: PropertyFilters, districts: DistrictSummary[]) {
  const noun = filters.type
    ? PLURAL_TYPE[filters.type]
    : filters.category === "commercial"
      ? "Commercial property"
      : filters.category === "land"
        ? "Land"
        : filters.category === "residential"
          ? "Homes"
          : "Property";

  const listing = filters.listing === "sale" ? " for sale" : filters.listing === "rent" ? " to rent" : "";
  const typedDistrict = filters.q
    ? districts.find((d) => d.name.toLowerCase() === filters.q!.toLowerCase().trim())
    : undefined;
  const place = districts.find((d) => d.slug === filters.district)?.name ?? typedDistrict?.name;
  if (!place && filters.q) return `${noun}${listing} matching “${filters.q}”`;
  return `${noun}${listing} in ${place ?? "Abuja"}`;
}
