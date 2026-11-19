import type * as React from "react";
import { cn } from "@/lib/utils";

/** Placeholder block shown while data loads. Purely visual: hidden from screen readers. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}
