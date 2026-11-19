import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/config/site";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  /**
   * "dark" for pages whose dominant colour is black (homepage hero, auth),
   * "light" for white pages (search, listings, property detail).
   */
  tone?: "light" | "dark";
  className?: string;
};

/** Public marketplace header. Dashboards use their own sidebar navigation. */
export function SiteHeader({ tone = "light", className }: SiteHeaderProps) {
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

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/list-property">List a property</Link>
          </Button>
        </div>

        <MobileNav items={mainNav} className="ml-auto lg:hidden" />
      </div>
    </header>
  );
}
