import { FavouriteButton } from "@/components/property/favourite-button";
import { PropertyCard } from "@/components/property/property-card";
import type { PropertyCardData } from "@/lib/properties/types";

type PropertyGridProps = {
  properties: PropertyCardData[];
  /** Ids the signed-in user has favourited. Omit (or empty) for guests: hearts start empty. */
  favouriteIds?: ReadonlySet<string>;
};

/**
 * Responsive grid of property cards, each with a favourite heart.
 * Clicking a card opens the property; the heart adds or removes it from favourites.
 * The first row loads its images eagerly.
 */
export function PropertyGrid({ properties, favouriteIds }: PropertyGridProps) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((p, i) => (
        <li key={p.id}>
          <PropertyCard
            property={p}
            priority={i < 3}
            className="h-full"
            saveAction={<FavouriteButton propertyId={p.id} initialFavourite={favouriteIds?.has(p.id) ?? false} />}
          />
        </li>
      ))}
    </ul>
  );
}
