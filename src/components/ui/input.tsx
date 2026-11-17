import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-md transition-colors",
        "placeholder:text-muted-foreground/70 hover:border-white/20",
        "focus-visible:border-gold-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid=true]:border-destructive/70 aria-[invalid=true]:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
