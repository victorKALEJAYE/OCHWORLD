import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ORGANIZATION_TYPE_LABELS } from "@/lib/properties/constants";
import { propertiesHref } from "@/lib/properties/filters";
import type { OrganizationSummary } from "@/lib/properties/types";

export function OrganizationList({ organizations }: { organizations: OrganizationSummary[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {organizations.map((org) => (
        <li key={org.slug} className="flex flex-col rounded-lg border bg-card p-6 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-lg font-bold">{org.name}</h2>
            <Badge variant="outline">{ORGANIZATION_TYPE_LABELS[org.type]}</Badge>
          </div>
          {org.about && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{org.about}</p>}
          <Link href={propertiesHref({ agency: org.slug })} className="link mt-auto pt-4 text-sm">
            View listings
          </Link>
        </li>
      ))}
    </ul>
  );
}
