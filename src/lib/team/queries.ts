import { DataLoadError } from "@/lib/errors";
import type { Enums } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

/** Organization members and open invitations. RLS and organization_team() limit what each role sees. */

export type TeamMember = {
  userId: string;
  name: string;
  email?: string;
  role: Enums<"org_role">;
  joinedAt: string;
};

export type PendingInvitation = {
  id: string;
  email: string;
  role: Enums<"org_role">;
  token: string;
  expiresAt: string;
  expired: boolean;
};

export async function getTeam(organizationId: string): Promise<TeamMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("organization_team", { org: organizationId });
  if (error) throw new DataLoadError("your team", error);
  return (data ?? []).map((m) => ({
    userId: m.user_id,
    name: m.full_name || "Unnamed member",
    email: m.email ?? undefined,
    role: m.role,
    joinedAt: m.joined_at,
  }));
}

/** Open invitations. Only owners and admins can read them (RLS); others get an empty list. */
export async function getPendingInvitations(organizationId: string): Promise<PendingInvitation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_invitations")
    .select("id, email, role, token, expires_at")
    .eq("organization_id", organizationId)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw new DataLoadError("invitations", error);
  const now = Date.now();
  return data.map((i) => ({
    id: i.id,
    email: i.email,
    role: i.role,
    token: i.token,
    expiresAt: i.expires_at,
    expired: new Date(i.expires_at).getTime() < now,
  }));
}
