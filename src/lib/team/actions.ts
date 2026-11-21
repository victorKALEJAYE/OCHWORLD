"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/** Team invitations and membership. RLS decides who may do what; see migration 5. */

const uuid = z.string().uuid();

export type InviteState =
  | { status: "idle" }
  | { status: "created"; email: string; token: string }
  | { status: "error"; message: string };

const inviteSchema = z.object({
  organizationId: z.string().uuid(),
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
  role: z.enum(["agent", "admin"]),
});

/** Creates an invitation link. Re-inviting the same email replaces the old link. */
export async function createInvitation(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const parsed = inviteSchema.safeParse({
    organizationId: formData.get("organizationId"),
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the form." };

  const { organizationId, email, role } = parsed.data;
  const supabase = await createClient();

  await supabase
    .from("organization_invitations")
    .delete()
    .eq("organization_id", organizationId)
    .eq("email", email) // stored lower-case by this action
    .is("accepted_at", null);

  const { data, error } = await supabase
    .from("organization_invitations")
    .insert({ organization_id: organizationId, email, role })
    .select("token")
    .single();

  if (error) {
    console.error("createInvitation failed", error);
    return {
      status: "error",
      message:
        error.code === "42501"
          ? "Only owners and admins can invite people."
          : "We couldn't create the invitation. Please try again.",
    };
  }
  revalidatePath("/dashboard/team");
  return { status: "created", email, token: data.token };
}

export async function cancelInvitation(formData: FormData): Promise<void> {
  const id = uuid.safeParse(formData.get("invitationId"));
  if (!id.success) return;
  const supabase = await createClient();
  const { error } = await supabase.from("organization_invitations").delete().eq("id", id.data);
  if (error) console.error("cancelInvitation failed", error);
  revalidatePath("/dashboard/team");
}

/** Removes a member, or lets a member leave. The database keeps at least one owner. */
export async function removeMember(formData: FormData): Promise<void> {
  const org = uuid.safeParse(formData.get("organizationId"));
  const user = uuid.safeParse(formData.get("userId"));
  if (!org.success || !user.success) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("organization_id", org.data)
    .eq("user_id", user.data);
  if (error) {
    console.error("removeMember failed", error);
    redirect(`/dashboard/team?org=${org.data}&error=remove`);
  }
  revalidatePath("/dashboard", "layout");
}

export async function acceptInvitation(formData: FormData): Promise<void> {
  const token = z.string().min(20).max(100).safeParse(formData.get("token"));
  if (!token.success) redirect("/dashboard");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_invitation", { invite_token: token.data });
  if (error) {
    const reason = error.code === "OCH02" ? "email" : error.code === "28000" ? "signin" : "invalid";
    redirect(`/invite/${encodeURIComponent(token.data)}?error=${reason}`);
  }
  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/listings?org=${data}`);
}
