import Image from "next/image";
import Link from "next/link";
import { Building2, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { deleteListing, setListingStatus } from "@/lib/listings/actions";
import type { ListingStatus, ManagedListing } from "@/lib/listings/queries";

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: "Draft",
  published: "Live",
  archived: "Archived",
};

const STATUS_BADGE: Record<ListingStatus, "success" | "neutral" | "outline"> = {
  published: "success",
  draft: "neutral",
  archived: "outline",
};

const updated = new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric" });

/** An organization's listings with quick actions. Works without JavaScript (plain forms). */
export function ManagedListingList({
  listings,
  organizationId,
  canDelete,
}: {
  listings: ManagedListing[];
  organizationId: string;
  canDelete: boolean;
}) {
  return (
    <ul className="divide-y rounded-lg border bg-background shadow-card">
      {listings.map((l) => (
        <li key={l.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-md bg-muted">
              {l.imageUrl ? (
                <Image src={l.imageUrl} alt="" fill sizes="96px" className="object-cover" />
              ) : (
                <Building2 className="absolute inset-0 m-auto size-6 text-muted-foreground" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_BADGE[l.status]}>{LISTING_STATUS_LABELS[l.status]}</Badge>
                {l.isFeatured && <Badge variant="gold">Featured</Badge>}
                {!l.imageUrl && <span className="text-xs text-muted-foreground">No photos</span>}
              </div>
              <Link href={`/dashboard/listings/${l.id}/edit`} className="line-clamp-1 font-semibold hover:underline">
                {l.title}
              </Link>
              <p className="text-sm text-muted-foreground">
                {formatPrice(l.price, l.rentPeriod)} · {l.district} · Updated {updated.format(new Date(l.updatedAt))}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/listings/${l.id}/edit`}>
                <Pencil /> Edit
              </Link>
            </Button>
            {l.status === "published" ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/properties/${l.slug}`} target="_blank">
                    <ExternalLink /> View
                  </Link>
                </Button>
                <StatusButton id={l.id} status="draft" label="Unpublish" />
              </>
            ) : (
              <StatusButton id={l.id} status="published" label="Publish" primary />
            )}
            {l.status !== "archived" && <StatusButton id={l.id} status="archived" label="Archive" />}
            {canDelete && <DeleteListingButton id={l.id} organizationId={organizationId} title={l.title} />}
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatusButton({ id, status, label, primary }: { id: string; status: ListingStatus; label: string; primary?: boolean }) {
  return (
    <form action={setListingStatus}>
      <input type="hidden" name="propertyId" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" size="sm" variant={primary ? "primary" : "ghost"}>
        {label}
      </Button>
    </form>
  );
}

/**
 * Two-step delete without a browser dialog: the first click opens a small
 * confirmation (native <details>), the second deletes.
 */
export function DeleteListingButton({ id, organizationId, title }: { id: string; organizationId: string; title: string }) {
  return (
    <details className="group relative">
      <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded-md px-3 text-sm font-semibold text-destructive hover:bg-destructive/10 [&::-webkit-details-marker]:hidden">
        <Trash2 className="size-4" aria-hidden="true" /> Delete
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-64 space-y-3 rounded-md border bg-background p-4 text-sm shadow-elevated">
        <p>
          Delete <strong className="font-semibold">{title}</strong> and its photos? This can&apos;t be undone.
        </p>
        <form action={deleteListing}>
          <input type="hidden" name="propertyId" value={id} />
          <input type="hidden" name="organizationId" value={organizationId} />
          <Button type="submit" variant="destructive" size="sm" className="w-full">
            Yes, delete it
          </Button>
        </form>
      </div>
    </details>
  );
}
