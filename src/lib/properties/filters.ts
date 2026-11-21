import { z } from "zod";
import { PROPERTY_TYPE_LABELS, SORT_OPTIONS, type SortOption } from "@/lib/properties/constants";
import type { ListingType, PropertyCategory, PropertyType } from "@/lib/properties/types";

/**
 * Search filters live in the URL (?listing=rent&district=maitama&beds=3…) so
 * results can be shared, bookmarked and rendered on the server.
 *
 * Parsing is forgiving: an invalid value is dropped rather than failing the
 * whole page, because URLs get edited by hand and shared in chats.
 */
export type PropertyFilters = {
  /** Free text from the homepage search box: a district name, estate or street. */
  q?: string;
  listing?: ListingType;
  category?: PropertyCategory;
  type?: PropertyType;
  district?: string;
  agency?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  sort: SortOption;
  page: number;
};

const propertyTypes = Object.keys(PROPERTY_TYPE_LABELS) as [PropertyType, ...PropertyType[]];
const sortValues = SORT_OPTIONS.map((o) => o.value) as [SortOption, ...SortOption[]];
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(80);
const amount = z.coerce.number().int().positive().max(100_000_000_000);

const fields = {
  q: z.string().trim().min(2).max(80),
  listing: z.enum(["sale", "rent"]),
  category: z.enum(["residential", "commercial", "land"]),
  type: z.enum(propertyTypes),
  district: slug,
  agency: slug,
  minPrice: amount,
  maxPrice: amount,
  beds: z.coerce.number().int().min(1).max(10),
  sort: z.enum(sortValues),
  page: z.coerce.number().int().min(1).max(500),
};

type RawParams = Record<string, string | string[] | undefined>;

function pick<T>(schema: z.ZodType<T>, value: string | string[] | undefined): T | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined || raw === "") return undefined;
  const result = schema.safeParse(raw);
  return result.success ? result.data : undefined;
}

export function parsePropertyFilters(params: RawParams): PropertyFilters {
  const filters: PropertyFilters = {
    q: pick(fields.q, params.q),
    listing: pick(fields.listing, params.listing),
    category: pick(fields.category, params.category),
    type: pick(fields.type, params.type),
    district: pick(fields.district, params.district),
    agency: pick(fields.agency, params.agency),
    minPrice: pick(fields.minPrice, params.minPrice),
    maxPrice: pick(fields.maxPrice, params.maxPrice),
    beds: pick(fields.beds, params.beds),
    sort: pick(fields.sort, params.sort) ?? "newest",
    page: pick(fields.page, params.page) ?? 1,
  };

  // A reversed range is almost always a mistake; swap rather than return nothing.
  if (filters.minPrice && filters.maxPrice && filters.minPrice > filters.maxPrice) {
    [filters.minPrice, filters.maxPrice] = [filters.maxPrice, filters.minPrice];
  }
  return filters;
}

/** Builds a /properties URL from filters, dropping defaults and empty values. */
export function propertiesHref(filters: Partial<PropertyFilters>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "") continue;
    if (key === "sort" && value === "newest") continue;
    if (key === "page" && value === 1) continue;
    params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `/properties?${query}` : "/properties";
}

/** True when any filter that narrows results is set (used for empty states). */
export function hasActiveFilters(f: PropertyFilters) {
  return Boolean(f.q || f.listing || f.category || f.type || f.district || f.agency || f.minPrice || f.maxPrice || f.beds);
}

/** "Wuse 2" → "wuse-2". Used to match typed text to a district slug. */
export function slugifyText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Characters that would break a PostgREST filter are removed; the rest is matched literally. */
export function sanitizeSearchText(value: string) {
  return value.replace(/[^\p{L}\p{N}\s'.-]/gu, " ").replace(/\s+/g, " ").trim();
}
