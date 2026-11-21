import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { ListingTypeToggle } from "@/components/search/listing-type-toggle";
import { PriceOptions } from "@/components/search/price-options";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CATEGORY_LABELS, PROPERTY_TYPE_LABELS, SORT_OPTIONS } from "@/lib/properties/constants";
import type { PropertyFilters } from "@/lib/properties/filters";
import type { DistrictSummary } from "@/lib/properties/types";

/**
 * Filters for /properties as a GET form, so filtering works without JavaScript
 * and every result set has its own URL. On phones the panel is collapsed behind
 * a "Filters" toggle (CSS-only, via a hidden checkbox).
 */
export function FilterBar({ filters, districts }: { filters: PropertyFilters; districts: DistrictSummary[] }) {
  return (
    <form action="/properties" method="get" role="search" aria-label="Filter properties">
      {/* agency filter is set from agent pages; keep it while refining other filters */}
      {filters.agency && <input type="hidden" name="agency" value={filters.agency} />}
      {filters.q && <input type="hidden" name="q" value={filters.q} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ListingTypeToggle includeAll defaultValue={filters.listing} />

        <div className="flex items-center gap-2">
          <Label htmlFor="f-sort" className="sr-only">
            Sort
          </Label>
          <Select id="f-sort" name="sort" defaultValue={filters.sort} className="h-10 w-48">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <label
            htmlFor="filters-toggle"
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold lg:hidden"
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" /> Filters
          </label>
        </div>
      </div>

      <input type="checkbox" id="filters-toggle" className="peer sr-only" />
      <div className="mt-4 hidden gap-4 rounded-lg border bg-surface p-4 peer-checked:grid sm:grid-cols-2 lg:grid lg:grid-cols-[repeat(6,minmax(0,1fr))_auto] lg:items-end">
        <FilterField id="f-district" label="Location">
          <Select id="f-district" name="district" defaultValue={filters.district ?? ""}>
            <option value="">All of Abuja</option>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField id="f-category" label="Category">
          <Select id="f-category" name="category" defaultValue={filters.category ?? ""}>
            <option value="">Any</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField id="f-type" label="Type">
          <Select id="f-type" name="type" defaultValue={filters.type ?? ""}>
            <option value="">Any type</option>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FilterField>

        <FilterField id="f-min" label="Min price">
          <Select id="f-min" name="minPrice" defaultValue={filters.minPrice?.toString() ?? ""}>
            <PriceOptions anyLabel="No min" />
          </Select>
        </FilterField>

        <FilterField id="f-max" label="Max price">
          <Select id="f-max" name="maxPrice" defaultValue={filters.maxPrice?.toString() ?? ""}>
            <PriceOptions anyLabel="No max" />
          </Select>
        </FilterField>

        <FilterField id="f-beds" label="Bedrooms">
          <Select id="f-beds" name="beds" defaultValue={filters.beds?.toString() ?? ""}>
            <option value="">Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </Select>
        </FilterField>

        <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
          <Button type="submit" className="flex-1 lg:flex-none">
            Apply
          </Button>
          <Button asChild variant="ghost">
            <Link href="/properties">Clear</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}

function FilterField({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}
