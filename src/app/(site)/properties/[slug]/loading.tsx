import { Skeleton } from "@/components/ui/skeleton";

/** Layout-shaped placeholder while a property loads. */
export default function PropertyLoading() {
  return (
    <div role="status" className="mx-auto max-w-content px-4 py-8 sm:px-6">
      <span className="sr-only">Loading property</span>
      <Skeleton className="mb-6 h-4 w-64" />
      <Skeleton className="aspect-[16/9] w-full rounded-lg sm:aspect-[21/9]" />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  );
}
