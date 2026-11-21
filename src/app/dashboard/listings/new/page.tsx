import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { ListingForm } from "@/components/listings/listing-form";
import { requireOnboardedAccount } from "@/lib/auth/account";
import { activeMembership } from "@/lib/auth/permissions";
import { getDistrictOptions } from "@/lib/listings/queries";

export const metadata: Metadata = { title: "Add a listing" };

type Props = { searchParams: Promise<{ org?: string }> };

export default async function NewListingPage({ searchParams }: Props) {
  const { org } = await searchParams;
  const account = await requireOnboardedAccount("/dashboard/listings/new");
  const membership = activeMembership(account, org);
  const districts = await getDistrictOptions();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link href={`/dashboard/listings?org=${membership.id}`} className="link inline-flex items-center gap-1 text-sm">
        <ArrowLeft className="size-4" aria-hidden="true" /> All listings
      </Link>
      <DashboardPageHeader
        eyebrow={membership.name}
        title="Add a listing"
        description="Step 1 of 2: the details. You'll add photos next, then publish when you're ready."
      />
      <ListingForm organizationId={membership.id} districts={districts} />
    </div>
  );
}
