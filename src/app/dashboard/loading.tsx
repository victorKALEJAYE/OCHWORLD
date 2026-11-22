import { Skeleton } from "@/components/ui/skeleton";

/** Dashboard placeholder: keeps the header and tabs, shapes the content while it loads. */
export default function DashboardLoading() {
  return (
    <div role="status" className="space-y-8">
      <span className="sr-only">Loading your dashboard</span>
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-56 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
