import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { AccountMenu } from "@/components/layout/account-menu";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/config/site";
import { getHeaderAccount, type HeaderAccount } from "@/lib/auth/account";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  /**
   * "dark" for pages whose dominant colour is black (homepage hero, auth),
   * "light" for white pages (search, listings, property detail, dashboard).
   */
  tone?: "light" | "dark";
  className?: string;
};

/** The one header for the whole site, public pages and dashboard alike. Knows who is signed in. */
export async function SiteHeader(props: SiteHeaderProps) {
  const account = await getHeaderAccount();
  return <SiteHeaderView {...props} account={account} />;
}

/**
 * Presentational header (also used by the design-system page and previews).
 * Guests see "Sign in"; signed-in users see their initials, which open the
 * account menu (favourites, enquiries, listings, sign out).
 */
export function SiteHeaderView({
  tone = "light",
  className,
  account,
}: SiteHeaderProps & { account: HeaderAccount | null }) {
  const isMember = Boolean(account?.organizations.length);
  const listHref = isMember ? `/dashboard/listings/new?org=${account!.organizations[0].id}` : "/list-property";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background text-foreground pt-[env(safe-area-inset-top)]",
        tone === "dark" && "dark",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-content items-center gap-6 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Main" className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {account ? (
            <>
              <Button asChild variant={isMember ? "primary" : "ghost"} size="sm" className="hidden lg:inline-flex">
                <Link href={listHref}>{isMember ? "Add a listing" : "List a property"}</Link>
              </Button>
              <AccountMenu account={account} className="ml-1" />
            </>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild variant="primary" size="sm">
                <Link href="/list-property">List a property</Link>
              </Button>
            </div>
          )}
          <MobileNav items={mainNav} signedIn={Boolean(account)} listHref={listHref} className="lg:hidden" />
        </div>
      </div>
    </header>
  );
}
