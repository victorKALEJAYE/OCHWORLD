import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PropertyGrid } from "@/components/property/property-grid";
import { Pagination } from "@/components/search/pagination";
import { Button } from "@/components/ui/button";
import { pluralize } from "@/lib/format";
import { PAGE_SIZE } from "@/lib/properties/constants";
import { hasActiveFilters, propertiesHref, type PropertyFilters } from "@/lib/properties/filters";
import { getFavouriteIds, searchProperties, type SearchResult } from "@/lib/properties/queries";

/** Fetches and renders results. Wrapped in <Suspense> by the page, keyed by the filters. */
export async function SearchResults({ filters }: { filters: PropertyFilters }) {
  let result: SearchResult;
  try {
    result = await searchProperties(filters);
  } catch (error) {
    console.error(error);
    return (
      <ErrorState
        action={
          <Button asChild variant="secondary">
            <Link href={propertiesHref(filters)}>Try again</Link>
          </Button>
        }
      />
    );
  }
  const favouriteIds = await getFavouriteIds(result.items.map((p) => p.id));
  return <SearchResultsView result={result} filters={filters} favouriteIds={favouriteIds} />;
}

export function SearchResultsView({
  result,
  filters,
  favouriteIds,
}: {
  result: SearchResult;
  filters: PropertyFilters;
  favouriteIds?: ReadonlySet<string>;
}) {
  if (result.items.length === 0) {
    const pastEnd = filters.page > 1;
    return (
      <EmptyState
        icon={SearchX}
        title={pastEnd ? "No more results" : "No properties match your search"}
        description={
          pastEnd
            ? "This page is past the end of the results."
            : hasActiveFilters(filters)
              ? "Try a wider price range, another district or fewer filters."
              : "New listings appear here as soon as agents publish them."
        }
        action={
          pastEnd || hasActiveFilters(filters) ? (
            <Button asChild variant="outline">
              <Link href={pastEnd ? propertiesHref({ ...filters, page: 1 }) : "/properties"}>
                {pastEnd ? "Back to first page" : "Clear filters"}
              </Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  const first = (result.page - 1) * PAGE_SIZE;
  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {result.pageCount > 1
          ? `Showing ${first + 1}–${first + result.items.length} of ${pluralize(result.total, "property", "properties")}`
          : pluralize(result.total, "property", "properties")}
      </p>
      <PropertyGrid properties={result.items} favouriteIds={favouriteIds} />
      <Pagination filters={filters} pageCount={result.pageCount} />
    </div>
  );
}
