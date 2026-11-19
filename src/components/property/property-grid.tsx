import { PropertyCard } from "@/components/property/property-card";
import type { PropertyCardData } from "@/lib/properties/types";

/** Responsive grid of property cards. The first row loads its images eagerly. */
export function PropertyGrid({ properties }: { properties: PropertyCardData[] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((p, i) => (
        <li key={p.id}>
          <PropertyCard property={p} priority={i < 3} className="h-full" />
        </li>
      ))}
    </ul>
  );
}
