import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { OrganizationPanel, SavedHomesPanel, SentEnquiriesPanel } from "@/components/dashboard/dashboard-sections";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireOnboardedAccount } from "@/lib/auth/account";
import {
  getOrganizationEnquiries,
  getOrganizationStats,
  getSavedProperties,
  getSentEnquiries,
} from "@/lib/dashboard/queries";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * One dashboard for every signed-in user, with panels chosen by role:
 *   - organization members: their organization's stats and enquiry inbox
 *   - everyone: favourites and enquiries they've sent
 * Listings, enquiries and team have their own tabs (see dashboard/layout.tsx).
 */
export default async function DashboardPage() {
  const account = await requireOnboardedAccount("/dashboard");
  const firstName = account.name?.split(" ")[0] || "there";

  const data = await Promise.all([
    Promise.all(
      account.memberships.map(async (m) => ({
        membership: m,
        stats: await getOrganizationStats(m.id),
        enquiries: await getOrganizationEnquiries(m.id),
      }))
    ),
    getSavedProperties(),
    getSentEnquiries(account.userId),
  ]).catch((error) => {
    console.error(error);
    return null;
  });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold">Hello, {firstName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {account.email}</p>
        </div>
        {account.isPlatformAdmin && (
          <Badge variant="solid" className="px-3 py-1 text-sm">
            <ShieldCheck /> Platform admin
          </Badge>
        )}
      </div>

      {!data ? (
        <ErrorState
          className="bg-background"
          action={
            <Button asChild variant="secondary">
              <Link href="/dashboard">Try again</Link>
            </Button>
          }
        />
      ) : (
        <>
          {data[0].map(({ membership, stats, enquiries }) => (
            <OrganizationPanel key={membership.id} membership={membership} stats={stats} enquiries={enquiries} />
          ))}
          <SavedHomesPanel properties={data[1]} />
          <SentEnquiriesPanel enquiries={data[2]} />
        </>
      )}
    </>
  );
}
