import type { Metadata } from "next";
import { FormAlert } from "@/components/auth/form-alert";
import { DashboardSection } from "@/components/dashboard/dashboard-sections";
import { InviteForm, InviteLink } from "@/components/dashboard/invite-form";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { ErrorState } from "@/components/feedback/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireOnboardedAccount } from "@/lib/auth/account";
import { cancelInvitation, removeMember } from "@/lib/dashboard/actions";
import {
  activeMembership,
  canManageTeam,
  getPendingInvitations,
  getTeam,
  type PendingInvitation,
  type TeamMember,
} from "@/lib/listings/queries";

export const metadata: Metadata = { title: "Team" };

type Props = { searchParams: Promise<{ org?: string; error?: string }> };

const ROLE_LABELS = { owner: "Owner", admin: "Admin", agent: "Agent" } as const;
const ROLE_HELP = "Agents add and edit listings and answer enquiries. Admins can also delete listings and manage the team.";

export default async function TeamPage({ searchParams }: Props) {
  const params = await searchParams;
  const account = await requireOnboardedAccount("/dashboard/team");
  const membership = activeMembership(account, params.org);
  const manager = canManageTeam(membership);

  let team: TeamMember[] | null = null;
  let invitations: PendingInvitation[] = [];
  try {
    [team, invitations] = await Promise.all([
      getTeam(membership.id),
      manager ? getPendingInvitations(membership.id) : Promise.resolve([]),
    ]);
  } catch (error) {
    console.error(error);
  }

  const owners = team?.filter((m) => m.role === "owner").length ?? 0;

  return (
    <>
      <DashboardPageHeader
        eyebrow={membership.name}
        title="Team"
        description={ROLE_HELP}
        memberships={account.memberships}
        activeId={membership.id}
        basePath="/dashboard/team"
      />

      {params.error === "remove" && (
        <FormAlert state={{ type: "error", message: "That person couldn't be removed. Every organization needs at least one owner." }} />
      )}

      {manager && (
        <DashboardSection title="Invite someone">
          <div className="rounded-lg border bg-background p-4 shadow-card sm:p-6">
            <InviteForm organizationId={membership.id} organizationName={membership.name} />
          </div>
        </DashboardSection>
      )}

      <DashboardSection title={`Members${team ? ` (${team.length})` : ""}`}>
        {!team ? (
          <ErrorState className="bg-background" />
        ) : (
          <ul className="divide-y rounded-lg border bg-background shadow-card">
            {team.map((m) => {
              const isMe = m.userId === account.userId;
              // Owners can remove anyone; admins anyone but owners; everyone can leave (but not the last owner).
              const canRemove =
                (isMe || membership.role === "owner" || (membership.role === "admin" && m.role !== "owner")) &&
                !(m.role === "owner" && owners <= 1);
              return (
                <li key={m.userId} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      {m.name} {isMe && <span className="font-normal text-muted-foreground">(you)</span>}
                    </p>
                    {m.email && <p className="truncate text-sm text-muted-foreground">{m.email}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={m.role === "owner" ? "solid" : "outline"}>{ROLE_LABELS[m.role]}</Badge>
                    {canRemove && (
                      <form action={removeMember}>
                        <input type="hidden" name="organizationId" value={membership.id} />
                        <input type="hidden" name="userId" value={m.userId} />
                        <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                          {isMe ? "Leave" : "Remove"}
                        </Button>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </DashboardSection>

      {manager && invitations.length > 0 && (
        <DashboardSection title="Open invitations">
          <ul className="space-y-3">
            {invitations.map((i) => (
              <li key={i.id} className="space-y-3 rounded-lg border bg-background p-4 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm">
                    <strong className="font-semibold">{i.email}</strong> · {ROLE_LABELS[i.role]}
                    {i.expired && <span className="text-destructive"> · Expired</span>}
                  </p>
                  <form action={cancelInvitation}>
                    <input type="hidden" name="invitationId" value={i.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      Cancel invite
                    </Button>
                  </form>
                </div>
                {!i.expired && <InviteLink token={i.token} organizationName={membership.name} />}
              </li>
            ))}
          </ul>
        </DashboardSection>
      )}
    </>
  );
}
