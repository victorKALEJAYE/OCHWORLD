import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

/** Any unknown address, a listing that was removed, or an unknown district/service. */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-md flex-1 place-items-center px-4 py-16">
        <EmptyState
          className="w-full bg-background"
          icon={SearchX}
          title="Page not found"
          description="The page you're looking for doesn't exist or has moved. The property may have been sold, let or taken down."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href="/properties">Browse properties</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Homepage</Link>
              </Button>
            </div>
          }
        />
      </main>
    </div>
  );
}
