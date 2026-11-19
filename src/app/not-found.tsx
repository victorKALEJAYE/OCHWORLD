import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/empty-state";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-4">
      <EmptyState
        className="w-full"
        icon={SearchX}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={
          <Button asChild variant="secondary">
            <Link href="/">Go to homepage</Link>
          </Button>
        }
      />
    </main>
  );
}
