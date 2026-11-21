import { redirect } from "next/navigation";
import type { Account, Membership } from "@/lib/auth/account";

/**
 * What a member may do in the UI, by role. These decide what to SHOW;
 * the database (RLS) decides what is actually allowed.
 */

/** The organization a dashboard page is working on: `?org=<id>`, or the user's first. */
export function activeMembership(account: Account, orgParam?: string): Membership {
  const membership = account.memberships.find((m) => m.id === orgParam) ?? account.memberships[0];
  if (!membership) redirect("/dashboard");
  return membership;
}

export const canManageTeam = (m: Membership) => m.role === "owner" || m.role === "admin";
export const canDeleteListings = canManageTeam;
