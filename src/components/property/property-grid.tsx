import { FavouriteButton } from "@/components/property/favourite-button";
import { PropertyCard } from "@/components/property/property-card";
import type { PropertyCardData } from "@/lib/properties/types";
import { cn } from "@/lib/utils";

type PropertyGridProps = {
  properties: PropertyCardData[];
  /** Ids the signed-in user has favourited. Omit (or empty) for guests: hearts start empty. */
  favouriteIds?: ReadonlySet<string>;
  /**
   * "row": on phones, one swipeable row (next card peeking in) instead of a
   * long stack; a normal grid from tablet width up. Use for short previews
   * (homepage, "More in ..."), not for search results.
   */
  layout?: "grid" | "row";
};

/**
 * Responsive grid of property cards, each with a favourite heart.
 * Clicking a card opens the property; the heart adds or removes it from favourites.
 * The first row loads its images eagerly.
 */
export function PropertyGrid({ properties, favouriteIds, layout = "grid" }: PropertyGridProps) {
  const row = layout === "row";
  return (
    <ul
      className={cn(
        "sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3",
        row
          ? "-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden"
          : "grid gap-6"
      )}
    >
      {properties.map((p, i) => (
        <li key={p.id} className={cn(row && "w-[85%] shrink-0 snap-start sm:w-auto")}>
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
