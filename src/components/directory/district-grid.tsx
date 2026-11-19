import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pluralize } from "@/lib/format";
import { propertiesHref } from "@/lib/properties/filters";
import type { DistrictSummary } from "@/lib/properties/types";

export function DistrictGrid({ districts }: { districts: DistrictSummary[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {districts.map((d) => (
        <li key={d.slug}>
          <Link
            href={propertiesHref({ district: d.slug })}
            className="group flex items-center justify-between rounded-lg border bg-card p-5 transition-colors hover:border-foreground"
          >
            <span>
              <span className="block font-display text-lg font-bold">{d.name}</span>
              <span className="text-sm text-muted-foreground">
                {d.listingCount > 0 ? pluralize(d.listingCount, "listing") : "No listings yet"}
              </span>
            </span>
            <ArrowRight
              className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
              aria-hidden="true"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
