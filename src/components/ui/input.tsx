import * as React from "react";
import { cn } from "@/lib/utils";

/** Shared field styling, also used by <Select>. */
export const fieldClasses = cn(
  "flex h-11 w-full rounded-md border border-input bg-background px-3.5 text-sm text-foreground transition-colors",
  "placeholder:text-muted-foreground",
  "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
  "disabled:cursor-not-allowed disabled:opacity-50",
  "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20"
);

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input type={type} ref={ref} className={cn(fieldClasses, className)} {...props} />
  )
);
Input.displayName = "Input";

export { Input };
