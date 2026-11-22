"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ErrorState } from "@/components/feedback/error-state";
import { Button } from "@/components/ui/button";

/**
 * Catches unexpected errors in any page and offers a retry instead of a blank
 * screen. A simple header (logo only) so visitors can always get home; the
 * full header needs the server, which may be what failed.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Replace with an error-tracking service (e.g. Sentry) when one is added.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="border-b bg-background pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-content items-center px-4 sm:px-6">
          <Logo />
        </div>
      </header>
      <main className="mx-auto grid w-full max-w-md flex-1 place-items-center px-4 py-16">
        <ErrorState
          className="w-full bg-background"
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={reset}>Try again</Button>
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
