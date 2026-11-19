import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Same footprint as <PropertyCard>, so the grid doesn't jump when data arrives. */
export function PropertyCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-lg border bg-card", className)}>
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-6 w-2/5" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-1 flex gap-4 border-t pt-3">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

/** A grid of skeleton cards for listing pages. */
export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div role="status" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <span className="sr-only">Loading properties</span>
      {Array.from({ length: count }, (_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
