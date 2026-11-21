import Link from "next/link";
import { Heart, Inbox, MessageSquare, Plus } from "lucide-react";
import { EnquiryStatusSelect } from "@/components/dashboard/enquiry-status-select";
import { EmptyState } from "@/components/feedback/empty-state";
import { PropertyGrid } from "@/components/property/property-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Membership } from "@/lib/auth/account";
import type { OrganizationStats } from "@/lib/dashboard/queries";
import type { EnquirySummary } from "@/lib/enquiries/queries";
import { formatListedDate } from "@/lib/format";
import { ORGANIZATION_TYPE_LABELS } from "@/lib/properties/constants";
import { cn } from "@/lib/utils";
import type { PropertyCardData } from "@/lib/properties/types";

/**
 * Presentational dashboard sections. The page loads the data; these only
 * render it, so each panel can be previewed and tested on its own.
 */

const ROLE_LABELS: Record<Membership["role"], string> = { owner: "Owner", admin: "Admin", agent: "Agent" };
const STATUS_LABELS: Record<EnquirySummary["status"], string> = { new: "New", responded: "Responded", closed: "Closed" };

export function DashboardSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function OrganizationPanel({
  membership,
  stats,
  enquiries,
}: {
  membership: Membership;
  stats: OrganizationStats;
  enquiries: EnquirySummary[];
}) {
  return (
    <div className="rounded-lg border bg-background shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b p-6">
        <div>
          <p className="eyebrow">{ORGANIZATION_TYPE_LABELS[membership.type]}</p>
          <h2 className="mt-1 text-2xl font-bold">{membership.name}</h2>
        </div>
        <Badge variant="outline">Your role: {ROLE_LABELS[membership.role]}</Badge>
      </div>

      <dl className="grid grid-cols-3 divide-x border-b">
        <Stat label="Published listings" value={stats.published} />
        <Stat label="Drafts" value={stats.drafts} />
        <Stat label="New enquiries" value={stats.newEnquiries} highlight={stats.newEnquiries > 0} />
      </dl>

      <div className="flex flex-wrap gap-2 border-b p-4 sm:px-6">
        <Button asChild size="sm">
          <Link href={`/dashboard/listings/new?org=${membership.id}`}>
            <Plus /> Add a listing
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={`/dashboard/listings?org=${membership.id}`}>Manage listings</Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href={`/dashboard/team?org=${membership.id}`}>Team</Link>
        </Button>
      </div>

      <div className="space-y-3 p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-bold">Latest enquiries</h3>
          {enquiries.length > 0 && (
            <Link href={`/dashboard/enquiries?org=${membership.id}`} className="link text-sm">
              Open inbox
            </Link>
          )}
        </div>
        {enquiries.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No enquiries yet"
            description="Messages from people interested in your listings will appear here."
            className="py-8"
          />
        ) : (
          <EnquiryList enquiries={enquiries} showSender />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="p-4 sm:p-6">
      <dt className="text-xs text-muted-foreground sm:text-sm">{label}</dt>
      <dd className="mt-1 flex items-center gap-2 font-display text-2xl font-bold">
        {value}
        {highlight && <span className="size-2 rounded-full bg-primary" aria-hidden="true" />}
      </dd>
    </div>
  );
}

export function EnquiryList({
  enquiries,
  showSender = false,
  manage = false,
  clamp = true,
}: {
  enquiries: EnquirySummary[];
  showSender?: boolean;
  /** Show a status picker instead of a badge (organization inbox). */
  manage?: boolean;
  clamp?: boolean;
}) {
  return (
    <ul className="divide-y rounded-md border">
      {enquiries.map((e) => (
        <li key={e.id} className="space-y-1 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              {showSender ? e.name : (e.property?.title ?? "Listing no longer available")}
            </p>
            {manage ? (
              <EnquiryStatusSelect enquiryId={e.id} status={e.status} />
            ) : (
              <Badge variant={e.status === "new" ? "gold" : "neutral"}>{STATUS_LABELS[e.status]}</Badge>
            )}
          </div>
          {showSender && e.property && (
            <p className="text-xs text-muted-foreground">
              About{" "}
              <Link href={`/properties/${e.property.slug}`} className="link">
                {e.property.title}
              </Link>
            </p>
          )}
          <p className={cn("whitespace-pre-line text-sm text-muted-foreground", clamp && "line-clamp-2")}>{e.message}</p>
          <p className="text-xs text-muted-foreground">
            {formatListedDate(e.createdAt).replace("Listed", "Sent")}
            {showSender && (
              <>
                {" · "}
                <a href={`mailto:${e.email}`} className="link">
                  {e.email}
                </a>
                {e.phone && (
                  <>
                    {" · "}
                    <a href={`tel:${e.phone.replace(/\s/g, "")}`} className="link">
                      {e.phone}
                    </a>
                  </>
                )}
              </>
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function SavedHomesPanel({ properties }: { properties: PropertyCardData[] }) {
  return (
    <DashboardSection
      title="Favourites"
      action={
        <Link href="/properties" className="link text-sm">
          Browse properties
        </Link>
      }
    >
      {properties.length > 0 ? (
        <PropertyGrid properties={properties} favouriteIds={new Set(properties.map((p) => p.id))} />
      ) : (
        <EmptyState
          icon={Heart}
          title="No favourites yet"
          description="Tap the heart on any property to keep it here."
          className="bg-background"
          action={
            <Button asChild variant="outline">
              <Link href="/properties">Start browsing</Link>
            </Button>
          }
        />
      )}
    </DashboardSection>
  );
}

export function SentEnquiriesPanel({ enquiries }: { enquiries: EnquirySummary[] }) {
  return (
    <DashboardSection title="Your enquiries">
      {enquiries.length > 0 ? (
        <div className="bg-background">
          <EnquiryList enquiries={enquiries} />
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No enquiries sent"
          description="Messages you send to agents from a listing page appear here."
          className="bg-background"
        />
      )}
    </DashboardSection>
  );
}
