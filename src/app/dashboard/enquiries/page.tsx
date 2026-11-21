import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { EnquiryList } from "@/components/dashboard/dashboard-sections";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { requireOnboardedAccount } from "@/lib/auth/account";
import { activeMembership } from "@/lib/auth/permissions";
import { getOrganizationEnquiries, type EnquirySummary } from "@/lib/enquiries/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Enquiries" };

type Status = EnquirySummary["status"];
type Props = { searchParams: Promise<{ org?: string; status?: string }> };

const FILTERS: { value?: Status; label: string }[] = [
  { value: "new", label: "New" },
  { value: "responded", label: "Responded" },
  { value: "closed", label: "Closed" },
  { label: "All" },
];

/** The organization's inbox. Opens on "New" so nothing waiting gets missed. */
export default async function EnquiriesPage({ searchParams }: Props) {
  const params = await searchParams;
  const account = await requireOnboardedAccount("/dashboard/enquiries");
  const membership = activeMembership(account, params.org);
  const status: Status | undefined =
    params.status === "all" ? undefined : (FILTERS.find((f) => f.value === params.status)?.value ?? "new");

  let enquiries: EnquirySummary[] | null = null;
  try {
    enquiries = await getOrganizationEnquiries(membership.id, 100, status);
  } catch (error) {
    console.error(error);
  }

  return (
    <>
      <DashboardPageHeader
        eyebrow={membership.name}
        title="Enquiries"
        description="Reply by email or phone, then mark the enquiry as responded."
        memberships={account.memberships}
        activeId={membership.id}
        basePath="/dashboard/enquiries"
      />

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.label}
            href={`/dashboard/enquiries?org=${membership.id}&status=${f.value ?? "all"}`}
            aria-current={f.value === status ? "page" : undefined}
            className={cn(
              "rounded-full border bg-background px-3 py-1 text-sm font-medium transition-colors hover:border-foreground",
              f.value === status && "border-foreground bg-foreground text-background"
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {!enquiries ? (
        <ErrorState className="bg-background" />
      ) : enquiries.length === 0 ? (
        <EmptyState
          icon={Inbox}
          className="bg-background"
          title={status === "new" ? "You're all caught up" : "Nothing here"}
          description={
            status === "new"
              ? "New messages from people interested in your listings will appear here."
              : "No enquiries with this status."
          }
        />
      ) : (
        <div className="bg-background shadow-card">
          <EnquiryList enquiries={enquiries} showSender manage clamp={false} />
        </div>
      )}
    </>
  );
}
