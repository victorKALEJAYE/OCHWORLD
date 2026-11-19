import type { ListingType } from "@/lib/properties/types";
import { cn } from "@/lib/utils";

const options: { value: ListingType | ""; label: string }[] = [
  { value: "sale", label: "Buy" },
  { value: "rent", label: "Rent" },
];

/**
 * Buy / Rent segmented control built from radio inputs, so it works inside a
 * plain GET form without JavaScript.
 */
export function ListingTypeToggle({
  defaultValue,
  includeAll = false,
  className,
}: {
  defaultValue?: ListingType;
  includeAll?: boolean;
  className?: string;
}) {
  const items = includeAll ? [{ value: "" as const, label: "All" }, ...options] : options;
  const selected = defaultValue ?? (includeAll ? "" : "sale");

  return (
    <fieldset className={cn("inline-flex rounded-md border p-1", className)}>
      <legend className="sr-only">Buy or rent</legend>
      {items.map((o) => (
        <label
          key={o.value || "all"}
          className="cursor-pointer rounded-sm px-4 py-1.5 text-sm font-semibold text-muted-foreground transition-colors has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
        >
          <input
            type="radio"
            name="listing"
            value={o.value}
            defaultChecked={o.value === selected}
            className="sr-only"
          />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}
