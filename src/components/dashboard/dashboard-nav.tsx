"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type DashboardNavItem = { href: string; label: string; badge?: number };

/** Tabs under the dashboard header. Scrolls sideways on small phones. */
export function DashboardNav({ items }: { items: DashboardNavItem[] }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  return (
    <nav aria-label="Dashboard" className="-mb-px flex gap-6 overflow-x-auto [scrollbar-width:none]">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
          className={cn(
            "flex shrink-0 items-center gap-2 border-b-2 border-transparent py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
            "aria-[current=page]:border-primary aria-[current=page]:text-foreground"
          )}
        >
          {item.label}
          {item.badge ? (
            <span className="rounded-full bg-primary px-1.5 text-[11px] font-bold leading-5 text-primary-foreground">
              {item.badge}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
