import { Search } from "lucide-react";
import { ListingTypeToggle } from "@/components/search/listing-type-toggle";
import { PriceOptions } from "@/components/search/price-options";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { PROPERTY_TYPE_LABELS } from "@/lib/properties/constants";
import type { DistrictSummary } from "@/lib/properties/types";

/**
 * Homepage search. A plain GET form to /properties: works without JavaScript,
 * and the resulting URL is shareable.
 */
export function HeroSearch({ districts }: { districts: DistrictSummary[] }) {
  return (
    <form action="/properties" method="get" role="search" className="rounded-lg border bg-card p-5 sm:p-6">
      <ListingTypeToggle className="mb-5" />

      <div className="grid gap-4 md:grid-cols-[1.6fr_1fr_1fr_1fr_auto] md:items-end">
        <Field id="hero-district" label="Location">
          <Select id="hero-district" name="district" defaultValue="">
            <option value="">All of Abuja</option>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="hero-type" label="Property type">
          <Select id="hero-type" name="type" defaultValue="">
            <option value="">Any type</option>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field id="hero-price" label="Max price">
          <Select id="hero-price" name="maxPrice" defaultValue="">
            <PriceOptions />
          </Select>
        </Field>

        <Field id="hero-beds" label="Bedrooms">
          <Select id="hero-beds" name="beds" defaultValue="">
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </Select>
        </Field>

        <Button type="submit" size="lg" className="h-11 w-full md:w-auto">
          <Search /> Search
        </Button>
      </div>
    </form>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="eyebrow">
        {label}
      </Label>
      {children}
    </div>
  );
}
