import { Bath, BedDouble, Building, Ruler, Sofa } from "lucide-react";
import { PROPERTY_TYPE_LABELS } from "@/lib/properties/constants";
import type { PropertyDetail } from "@/lib/properties/types";

/** Key facts strip on the property detail page. Only shows facts the listing has. */
export function PropertyFacts({ property }: { property: PropertyDetail }) {
  const facts = [
    { icon: Building, label: "Type", value: PROPERTY_TYPE_LABELS[property.propertyType] },
    property.bedrooms !== undefined && { icon: BedDouble, label: "Bedrooms", value: String(property.bedrooms) },
    property.bathrooms !== undefined && { icon: Bath, label: "Bathrooms", value: String(property.bathrooms) },
    property.areaSqm !== undefined && {
      icon: Ruler,
      label: property.category === "land" ? "Plot size" : "Floor area",
      value: `${property.areaSqm.toLocaleString()} m²`,
    },
    property.category !== "land" && {
      icon: Sofa,
      label: "Furnishing",
      value: property.isFurnished ? "Furnished" : "Unfurnished",
    },
  ].filter(Boolean) as { icon: typeof Building; label: string; value: string }[];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-3 lg:grid-cols-5">
      {facts.map(({ icon: Icon, label, value }) => (
        <div key={label} className="bg-background p-4">
          <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon className="size-3.5" aria-hidden="true" />
            {label}
          </dt>
          <dd className="mt-1 font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
