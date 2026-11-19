import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/brand/logo";
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
 * Listing management (Phase 5) and super admin tools (Phase 6) build on this.
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
    <div className="min-h-dvh bg-surface">
      <header className="border-b bg-background pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4 sm:px-6">
          <Logo href="/" />
          <form action="/auth/sign-out" method="post">
            <Button type="submit" variant="outline" size="sm">
              <LogOut /> Sign out
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-content space-y-10 px-4 py-10 sm:px-6">
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
      </main>
    </div>
  );
}
