import Link from "next/link";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { DashboardNav, type DashboardNavItem } from "@/components/dashboard/dashboard-nav";
import { Button } from "@/components/ui/button";
import { requireOnboardedAccount } from "@/lib/auth/account";

/** Shared header and tabs for every dashboard page. Tabs depend on the user's roles. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const account = await requireOnboardedAccount("/dashboard");
  const isMember = account.memberships.length > 0;

  const items: DashboardNavItem[] = [
    { href: "/dashboard", label: "Overview" },
    ...(isMember
      ? [
          { href: "/dashboard/listings", label: "Listings" },
          { href: "/dashboard/enquiries", label: "Enquiries" },
          { href: "/dashboard/team", label: "Team" },
        ]
      : []),
  ];

  return (
    <div className="min-h-dvh bg-surface">
      <header className="border-b bg-background pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between gap-4 px-4 sm:px-6">
          <Logo href="/" />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/properties">View site</Link>
            </Button>
            <form action="/auth/sign-out" method="post">
              <Button type="submit" variant="outline" size="sm">
                <LogOut /> Sign out
              </Button>
            </form>
          </div>
        </div>
        {items.length > 1 && (
          <div className="mx-auto max-w-content px-4 sm:px-6">
            <DashboardNav items={items} />
          </div>
        )}
      </header>
      <main className="mx-auto max-w-content space-y-10 px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
