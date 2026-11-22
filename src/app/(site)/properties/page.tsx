import type { Metadata } from "next";
import { Suspense } from "react";
import { PropertyGridSkeleton } from "@/components/property/property-card-skeleton";
import { SearchResults } from "@/components/property/search-results";
import { FilterBar } from "@/components/search/filter-bar";
import { describeSearch } from "@/lib/properties/describe";
import { parsePropertyFilters } from "@/lib/properties/filters";
import { getDistricts } from "@/lib/properties/queries";
import type { DistrictSummary } from "@/lib/properties/types";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

async function loadDistricts(): Promise<DistrictSummary[]> {
  return getDistricts().catch((error) => {
    console.error(error);
    return [];
  });
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const filters = parsePropertyFilters(await searchParams);
  const title = describeSearch(filters, await loadDistricts());
  return { title, description: `${title} on OCHWORLD. Compare prices, photos and details, and contact agents directly.` };
}

/** Search and listings: white page, filters in the URL, results streamed with skeletons. */
export default async function PropertiesPage({ searchParams }: Props) {
  const filters = parsePropertyFilters(await searchParams);
  const districts = await loadDistricts();

  return (
    <>
      <main className="mx-auto max-w-content space-y-8 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">{describeSearch(filters, districts)}</h1>
        <FilterBar filters={filters} districts={districts} />
        {/* key: show the skeleton again whenever the filters change */}
        <Suspense key={JSON.stringify(filters)} fallback={<PropertyGridSkeleton />}>
          <SearchResults filters={filters} />
        </Suspense>
      </main>
    </>
  );
}
