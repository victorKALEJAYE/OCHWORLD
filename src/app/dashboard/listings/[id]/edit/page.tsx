import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { FormAlert } from "@/components/auth/form-alert";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { ListingForm } from "@/components/listings/listing-form";
import { DeleteListingButton, LISTING_STATUS_LABELS } from "@/components/listings/managed-listing-list";
import { PhotoManager } from "@/components/listings/photo-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireOnboardedAccount } from "@/lib/auth/account";
import { setListingStatus } from "@/lib/listings/actions";
import { canDeleteListings } from "@/lib/auth/permissions";
import { getDistrictOptions, getEditableListing } from "@/lib/listings/queries";

export const metadata: Metadata = { title: "Edit listing" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

export default async function EditListingPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { created } = await searchParams;
  const account = await requireOnboardedAccount(`/dashboard/listings/${id}/edit`);
  const [listing, districts] = await Promise.all([getEditableListing(id), getDistrictOptions()]);

  // Published listings are publicly readable, so also check the user is on this listing's team.
  const membership = listing && account.memberships.find((m) => m.id === listing.organizationId);
  if (!listing || (!membership && !account.isPlatformAdmin)) notFound();

  const isPublished = listing.status === "published";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href={`/dashboard/listings?org=${listing.organizationId}`} className="link inline-flex items-center gap-1 text-sm">
        <ArrowLeft className="size-4" aria-hidden="true" /> All listings
      </Link>

      <DashboardPageHeader
        eyebrow={membership?.name ?? "Platform admin"}
        title={listing.title}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isPublished ? "success" : "neutral"} className="px-2.5 py-1 text-sm">
              {LISTING_STATUS_LABELS[listing.status]}
            </Badge>
            {isPublished && (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/properties/${listing.slug}`} target="_blank">
                  <ExternalLink /> View live
                </Link>
              </Button>
            )}
          </div>
        }
      />

      {created && (
        <FormAlert
          state={{ type: "success", message: "Draft saved. Add photos below, then publish when you're ready." }}
        />
      )}

      <PhotoManager organizationId={listing.organizationId} propertyId={listing.id} photos={listing.photos} />

      <ListingForm organizationId={listing.organizationId} districts={districts} listing={listing} />

      <section className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-dashed p-4 sm:p-6">
        <div>
          <h2 className="text-base font-bold">{isPublished ? "Take it off the marketplace" : "Status"}</h2>
          <p className="text-sm text-muted-foreground">
            {isPublished
              ? "Unpublishing hides it from search straight away. You can publish it again any time."
              : "Archive listings that are sold or let, to keep your list tidy."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={setListingStatus}>
            <input type="hidden" name="propertyId" value={listing.id} />
            <input type="hidden" name="status" value={listing.status === "draft" ? "archived" : "draft"} />
            <Button type="submit" variant="outline" size="sm">
              {isPublished ? "Unpublish" : listing.status === "draft" ? "Archive" : "Restore to drafts"}
            </Button>
          </form>
          {(membership ? canDeleteListings(membership) : account.isPlatformAdmin) && (
            <DeleteListingButton id={listing.id} organizationId={listing.organizationId} title={listing.title} />
          )}
        </div>
      </section>
    </div>
  );
}
