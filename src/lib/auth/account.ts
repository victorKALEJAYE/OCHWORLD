import { cache } from "react";
import { redirect } from "next/navigation";
import type { Database, Enums } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type OrgRole = Enums<"org_role">;
export type Membership = Database["public"]["Functions"]["my_organizations"]["Returns"][number];

export type Account = {
  userId: string;
  email?: string;
  name?: string;
  onboarded: boolean;
  /** Organizations the user belongs to, with their role in each. */
  memberships: Membership[];
  isPlatformAdmin: boolean;
};

/**
 * Everything the app needs to know about the signed-in user, loaded once per
 * request. Roles here come from the database (organization_members and
 * platform_admins), never from user metadata.
 *
 * This is for deciding what to SHOW. What a user can actually read or change
 * is enforced by RLS in the database, so a wrong UI check can't leak data.
 */
export const getAccount = cache(async (): Promise<Account | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profile, memberships, admin] = await Promise.all([
    supabase.from("profiles").select("full_name, onboarded_at").eq("id", user.id).maybeSingle(),
    supabase.rpc("my_organizations"),
    supabase.rpc("is_platform_admin"),
  ]);

  if (profile.error) throw profile.error;
  if (memberships.error) throw memberships.error;
  if (admin.error) throw admin.error;

  const meta = user.user_metadata as { full_name?: string; name?: string };
  return {
    userId: user.id,
    email: user.email,
    name: profile.data?.full_name ?? meta.full_name ?? meta.name ?? undefined,
    onboarded: Boolean(profile.data?.onboarded_at),
    memberships: memberships.data ?? [],
    isPlatformAdmin: admin.data === true,
  };
});

/** For protected pages: the account, or a redirect to sign-in that returns here. */
export async function requireAccount(returnTo: string): Promise<Account> {
  const account = await getAccount();
  if (!account) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  return account;
}

/** Like requireAccount, and sends users who haven't finished sign-up to onboarding. */
export async function requireOnboardedAccount(returnTo: string): Promise<Account> {
  const account = await requireAccount(returnTo);
  if (!account.onboarded) redirect("/onboarding");
  return account;
}

/** What the site header needs to show a signed-in user. */
export type HeaderAccount = {
  name: string;
  email?: string;
  initials: string;
  onboarded: boolean;
  isPlatformAdmin: boolean;
  /** Organizations the user works in (agency, landlord, developer). */
  organizations: { id: string; name: string; role: Membership["role"] }[];
};

/** "Adaeze Okafor" → "AO"; falls back to the email's first letter. */
export function initialsFor(name?: string, email?: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const letters = parts.length >= 2 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0]?.[0] ?? email?.[0] ?? "?");
  return letters.toUpperCase();
}

/** The header's view of the signed-in user, or null for guests. Never throws: a failure just shows the guest header. */
export async function getHeaderAccount(): Promise<HeaderAccount | null> {
  try {
    const account = await getAccount();
    if (!account) return null;
    const name = account.name || account.email?.split("@")[0] || "Your account";
    return {
      name,
      email: account.email,
      initials: initialsFor(account.name, account.email),
      onboarded: account.onboarded,
      isPlatformAdmin: account.isPlatformAdmin,
      organizations: account.memberships.map((m) => ({ id: m.id, name: m.name, role: m.role })),
    };
  } catch (error) {
    console.error("getHeaderAccount failed", error);
    return null;
  }
}
