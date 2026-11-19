import type {
  DistrictSummary,
  OrganizationSummary,
  PropertyCardData,
  PropertyDetail,
} from "@/lib/properties/types";
import type { Tables, Views } from "@/lib/supabase/database.types";

/** Columns needed for a property card. Keep in sync with `toPropertyCard`. */
export const CARD_COLUMNS =
  "id, slug, title, listing_type, price, rent_period, bedrooms, bathrooms, area_sqm, is_featured, district:districts(name), property_images(url, position)";

/** Columns for the detail page. */
export const DETAIL_COLUMNS =
  "id, slug, title, description, listing_type, category, property_type, price, rent_period, address, bedrooms, bathrooms, area_sqm, is_furnished, is_featured, features, published_at, district:districts(name, slug), organization:organizations(id, name, slug, type), property_images(url, alt, position)";

type CardRow = Pick<
  Tables<"properties">,
  "id" | "slug" | "title" | "listing_type" | "price" | "rent_period" | "bedrooms" | "bathrooms" | "area_sqm" | "is_featured"
> & {
  district: Pick<Tables<"districts">, "name"> | null;
  property_images: Pick<Tables<"property_images">, "url" | "position">[];
};

type DetailRow = Omit<CardRow, "district" | "property_images"> &
  Pick<
    Tables<"properties">,
    "description" | "category" | "property_type" | "address" | "is_furnished" | "features" | "published_at"
  > & {
    district: Pick<Tables<"districts">, "name" | "slug"> | null;
    organization: Pick<Tables<"organizations">, "id" | "name" | "slug" | "type"> | null;
    property_images: Pick<Tables<"property_images">, "url" | "alt" | "position">[];
  };

const orUndefined = <T>(value: T | null): T | undefined => (value === null ? undefined : value);

function firstImage(images: { url: string; position: number }[]) {
  return [...images].sort((a, b) => a.position - b.position)[0]?.url;
}

export function toPropertyCard(row: CardRow): PropertyCardData {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    listingType: row.listing_type,
    price: row.price,
    rentPeriod: orUndefined(row.rent_period),
    district: row.district?.name ?? "Abuja",
    bedrooms: orUndefined(row.bedrooms),
    bathrooms: orUndefined(row.bathrooms),
    areaSqm: orUndefined(row.area_sqm),
    imageUrl: firstImage(row.property_images),
    isFeatured: row.is_featured,
  };
}

export function toPropertyDetail(row: DetailRow): PropertyDetail {
  const images = [...row.property_images]
    .sort((a, b) => a.position - b.position)
    .map((img) => ({ url: img.url, alt: img.alt ?? row.title }));

  return {
    ...toPropertyCard({ ...row, property_images: row.property_images }),
    description: orUndefined(row.description),
    category: row.category,
    propertyType: row.property_type,
    districtSlug: row.district?.slug ?? "",
    address: orUndefined(row.address),
    isFurnished: row.is_furnished,
    features: row.features,
    publishedAt: orUndefined(row.published_at),
    images,
    // Phone is added separately from `organization_contacts` (see queries.ts).
    organization: {
      id: row.organization?.id ?? "",
      name: row.organization?.name ?? "Unknown",
      slug: row.organization?.slug ?? "",
      type: row.organization?.type ?? "agency",
    },
  };
}

export function toDistrictSummary(row: Views<"district_listing_counts">): DistrictSummary {
  return { name: row.name, slug: row.slug, listingCount: row.listing_count };
}

export function toOrganizationSummary(
  row: Pick<Tables<"organizations">, "name" | "slug" | "type" | "about">
): OrganizationSummary {
  return { name: row.name, slug: row.slug, type: row.type, about: orUndefined(row.about) };
}
