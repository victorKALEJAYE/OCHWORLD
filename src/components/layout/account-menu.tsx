"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Heart, Inbox, LayoutDashboard, LogOut, MessageSquare, Plus, UserCog, Users } from "lucide-react";
import type { HeaderAccount } from "@/lib/auth/account";
import { cn } from "@/lib/utils";

type MenuLink = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

/** The links a signed-in user gets, grouped. Shared by the desktop menu and the mobile panel. */
export function accountMenuGroups(account: HeaderAccount): { title?: string; links: MenuLink[] }[] {
  const groups: { title?: string; links: MenuLink[] }[] = [];
  if (!account.onboarded) {
    groups.push({ links: [{ href: "/onboarding", label: "Finish setting up your account", icon: UserCog }] });
  }
  groups.push({
    title: "Your home search",
    links: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard#favourites", label: "Favourites", icon: Heart },
      { href: "/dashboard#enquiries", label: "Enquiries you sent", icon: MessageSquare },
    ],
  });
  if (account.organizations.length > 0) {
    const org = account.organizations[0];
    const q = `?org=${org.id}`;
    groups.push({
      title: account.organizations.length === 1 ? org.name : "Your business",
      links: [
        { href: `/dashboard/listings${q}`, label: "Your listings", icon: Building2 },
        { href: `/dashboard/listings/new${q}`, label: "Add a listing", icon: Plus },
        { href: `/dashboard/enquiries${q}`, label: "Enquiry inbox", icon: Inbox },
        { href: `/dashboard/team${q}`, label: "Team", icon: Users },
      ],
    });
  }
  return groups;
}

/** Round badge with the user's initials, like most marketplaces use to show "you're signed in". */
export function AccountAvatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-foreground font-display text-sm font-bold text-background",
        className
      )}
    >
      {initials}
    </span>
  );
}

/**
 * Avatar button + dropdown with the user's links and sign out.
 * Closes on outside click, Escape and navigation; focus returns to the button.
 */
export function AccountMenu({ account, className }: { account: HeaderAccount; className?: string }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const panelId = React.useId();

  React.useEffect(() => setOpen(false), [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`Account menu for ${account.name}`}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full outline-none ring-offset-2 ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-primary aria-expanded:ring-2 aria-expanded:ring-primary"
      >
        <AccountAvatar initials={account.initials} />
      </button>

      <div
        ref={panelRef}
        id={panelId}
        hidden={!open}
        className="absolute right-0 top-full z-50 mt-3 w-72 overflow-hidden rounded-lg border bg-background text-foreground shadow-elevated"
      >
        <AccountMenuContent account={account} />
      </div>
    </div>
  );
}

/** Name, grouped links and sign out. Used inside the dropdown and the mobile menu. */
export function AccountMenuContent({ account }: { account: HeaderAccount }) {
  return (
    <div>
      <div className="flex items-center gap-3 border-b p-4">
        <AccountAvatar initials={account.initials} className="size-10" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{account.name}</p>
          {account.email && <p className="truncate text-xs text-muted-foreground">{account.email}</p>}
        </div>
      </div>
      {accountMenuGroups(account).map((group, i) => (
        <div key={i} className="border-b py-2">
          {group.title && <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.title}</p>}
          <ul>
            {group.links.map(({ href, label, icon: Icon }) => (
              <li key={href + label}>
                <Link href={href} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted">
                  <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <form action="/auth/sign-out" method="post" className="py-2">
        <button type="submit" className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted">
          <LogOut className="size-4 text-muted-foreground" aria-hidden="true" />
          Sign out
        </button>
      </form>
    </div>
  );
}
