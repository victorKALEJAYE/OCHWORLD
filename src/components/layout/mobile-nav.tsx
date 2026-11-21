"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NavItem } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Collapsible menu for small screens. Closes on navigation and on Escape.
 * Signed-in users reach their account links through the avatar beside it.
 */
export function MobileNav({
  items,
  className,
  signedIn = false,
  listHref = "/list-property",
}: {
  items: NavItem[];
  className?: string;
  signedIn?: boolean;
  listHref?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const panelId = React.useId();

  React.useEffect(() => setOpen(false), [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={className}>
      <Button
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X /> : <Menu />}
      </Button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b bg-background px-4 pb-6 pt-2 shadow-elevated"
      >
        <nav aria-label="Mobile">
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block border-b py-3.5 text-base font-medium">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={cn("mt-5 grid gap-3", signedIn ? "grid-cols-1" : "grid-cols-2")}>
          {!signedIn && (
            <Button asChild variant="outline">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )}
          <Button asChild variant="primary">
            <Link href={listHref}>{listHref === "/list-property" ? "List a property" : "Add a listing"}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
