import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Building2, MapPin, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { PropertyCardData } from "@/lib/properties/types";
import { cn } from "@/lib/utils";

type PropertyCardProps = {
  property: PropertyCardData;
  /**
   * Slot for the save (heart) button. It needs auth and a client component,
   * so the page passes it in rather than the card fetching anything itself.
   */
  saveAction?: React.ReactNode;
  className?: string;
  /** Set on the first cards in view so their image loads eagerly. */
  priority?: boolean;
};

/**
 * Listing card used on the homepage, search results and agent profiles.
 * The whole card is one link; the save button sits above it in the stacking order.
 */
export function PropertyCard({ property, saveAction, className, priority }: PropertyCardProps) {
  const { slug, title, listingType, price, rentPeriod, district, bedrooms, bathrooms, areaSqm, imageUrl, isFeatured } =
    property;

  return (
    <article className={cn("group relative flex flex-col overflow-hidden rounded-lg border bg-card shadow-card", className)}>
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <Building2 className="size-10" aria-hidden="true" />
          </div>
        )}

        <div className="absolute left-3 top-3 flex gap-1.5">
          <Badge variant="solid">{listingType === "sale" ? "For sale" : "For rent"}</Badge>
          {isFeatured && <Badge variant="brand">Featured</Badge>}
        </div>

        {saveAction && <div className="absolute right-3 top-3 z-10">{saveAction}</div>}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="font-display text-xl font-bold">{formatPrice(price, rentPeriod)}</p>

        <h3 className="line-clamp-1 text-base font-semibold">
          <Link
            href={`/properties/${slug}`}
            className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-ring"
          >
            {title}
          </Link>
        </h3>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          {district}, Abuja
        </p>

        <PropertySpecs bedrooms={bedrooms} bathrooms={bathrooms} areaSqm={areaSqm} />
      </div>
    </article>
  );
}

function PropertySpecs({ bedrooms, bathrooms, areaSqm }: Pick<PropertyCardData, "bedrooms" | "bathrooms" | "areaSqm">) {
  const specs = [
    bedrooms !== undefined && { icon: BedDouble, label: `${bedrooms} bed` },
    bathrooms !== undefined && { icon: Bath, label: `${bathrooms} bath` },
    areaSqm !== undefined && { icon: Ruler, label: `${areaSqm.toLocaleString()} m²` },
  ].filter(Boolean) as { icon: typeof BedDouble; label: string }[];

  if (specs.length === 0) return null;

  return (
    <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-sm text-foreground">
      {specs.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-1.5">
          <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}
