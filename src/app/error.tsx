"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/feedback/error-state";

/** Catches unexpected errors in any page and offers a retry instead of a blank screen. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Replace with an error-tracking service (e.g. Sentry) when one is added.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-4">
      <ErrorState
        className="w-full"
        action={
          <Button variant="secondary" onClick={reset}>
            Try again
          </Button>
        }
      />
    </main>
  );
}
