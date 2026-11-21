import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { FormAlert } from "@/components/auth/form-alert";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LISTING_STATUS_LABELS, ManagedListingList } from "@/components/listings/managed-listing-list";
import { Button } from "@/components/ui/button";
import { requireOnboardedAccount } from "@/lib/auth/account";
import {
  activeMembership,
  canDeleteListings,
  getManagedListings,
  type ListingStatus,
  type ManagedListing,
} from "@/lib/listings/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Your listings" };

type Props = { searchParams: Promise<{ org?: string; status?: string; deleted?: string; error?: string }> };

const FILTERS: (ListingStatus | undefined)[] = [undefined, "published", "draft", "archived"];

export default async function ListingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const account = await requireOnboardedAccount("/dashboard/listings");
  const membership = activeMembership(account, params.org);
  const status = FILTERS.find((f) => f && f === params.status);

  let listings: ManagedListing[] | null = null;
  try {
    listings = await getManagedListings(membership.id, status);
  } catch (error) {
    console.error(error);
  }

  const href = (s?: ListingStatus) => `/dashboard/listings?org=${membership.id}${s ? `&status=${s}` : ""}`;

  return (
    <>
      <DashboardPageHeader
        eyebrow={membership.name}
        title="Listings"
        description="Drafts are only visible to your team. Publish a listing to put it on the marketplace."
        memberships={account.memberships}
        activeId={membership.id}
        basePath="/dashboard/listings"
        action={
          <Button asChild>
            <Link href={`/dashboard/listings/new?org=${membership.id}`}>
              <Plus /> Add a listing
            </Link>
          </Button>
        }
      />

      {params.deleted && <FormAlert state={{ type: "success", message: "Listing deleted." }} />}
      {params.error === "delete" && (
        <FormAlert state={{ type: "error", message: "That listing couldn't be deleted. Only owners and admins can delete listings." }} />
      )}

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f ?? "all"}
            href={href(f)}
            aria-current={f === status ? "page" : undefined}
            className={cn(
              "rounded-full border bg-background px-3 py-1 text-sm font-medium transition-colors hover:border-foreground",
              f === status && "border-foreground bg-foreground text-background"
            )}
          >
            {f ? LISTING_STATUS_LABELS[f] : "All"}
          </Link>
        ))}
      </nav>

      {!listings ? (
        <ErrorState className="bg-background" />
      ) : listings.length === 0 ? (
        <EmptyState
          icon={Building2}
          className="bg-background"
          title={status ? `No ${LISTING_STATUS_LABELS[status].toLowerCase()} listings` : "No listings yet"}
          description="Add your first property: details first, then photos, then publish."
          action={
            <Button asChild>
              <Link href={`/dashboard/listings/new?org=${membership.id}`}>
                <Plus /> Add a listing
              </Link>
            </Button>
          }
        />
      ) : (
        <ManagedListingList listings={listings} organizationId={membership.id} canDelete={canDeleteListings(membership)} />
      )}
    </>
  );
}
