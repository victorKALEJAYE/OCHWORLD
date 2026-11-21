import { DashboardNav, type DashboardNavItem } from "@/components/dashboard/dashboard-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { requireOnboardedAccount } from "@/lib/auth/account";

/**
 * The dashboard is part of the site: same header (with the account menu),
 * plus tabs for the sections this user's roles allow.
 */
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
      <SiteHeader />
      {items.length > 1 && (
        <div className="border-b bg-background">
          <div className="mx-auto max-w-content px-4 sm:px-6">
            <DashboardNav items={items} />
          </div>
        </div>
      )}
      <main className="mx-auto max-w-content space-y-10 px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
