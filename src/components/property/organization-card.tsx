import Link from "next/link";
import { Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ORGANIZATION_TYPE_LABELS } from "@/lib/properties/constants";
import type { ListingOrganization } from "@/lib/properties/types";

/**
 * Who is listing the property.
 *
 * Phone numbers come from the `organization_contacts` view, which only returns
 * business numbers. Private landlords are reached through the enquiry form.
 */
export function OrganizationCard({ organization }: { organization: ListingOrganization }) {
  const initials = organization.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const showPhone = Boolean(organization.phone);

  return (
    <div className="flex items-start gap-4">
      <span
        aria-hidden="true"
        className="grid size-12 shrink-0 place-items-center rounded-full bg-foreground font-display text-sm font-bold text-background"
      >
        {initials}
      </span>
      <div className="min-w-0 space-y-1">
        <p className="eyebrow">Listed by</p>
        <p className="truncate font-semibold">{organization.name}</p>
        <Badge variant="outline">{ORGANIZATION_TYPE_LABELS[organization.type]}</Badge>
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm">
          {showPhone && (
            <a href={`tel:${organization.phone!.replace(/\s/g, "")}`} className="link inline-flex items-center gap-1.5">
              <Phone className="size-3.5" aria-hidden="true" />
              {organization.phone}
            </a>
          )}
          {organization.slug && (
            <Link href={`/properties?agency=${organization.slug}`} className="link">
              More listings
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
