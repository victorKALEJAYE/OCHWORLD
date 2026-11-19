import * as React from "react";
import { ChevronDown } from "lucide-react";
import { fieldClasses } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Styled native <select>. Native is deliberate: it is accessible, works with
 * forms and URL search params without JavaScript, and uses the phone's own picker.
 */
const Select = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select ref={ref} className={cn(fieldClasses, "appearance-none pr-10", className)} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
);
Select.displayName = "Select";

export { Select };
