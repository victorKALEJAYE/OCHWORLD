import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { FormAlert } from "@/components/auth/form-alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccount } from "@/lib/auth/account";
import { acceptInvitation } from "@/lib/team/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Team invitation", robots: { index: false } };

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
};

const ERRORS: Record<string, string> = {
  email: "You're signed in with a different email from the one invited. Sign out and sign in with the invited email.",
  invalid: "This invitation is no longer valid. Ask for a new link.",
  signin: "Please sign in first.",
};

const ROLE_LABELS = { owner: "an owner", admin: "an admin", agent: "an agent" } as const;

/** Where invited teammates land. Shows who invited them, then joins on one click. */
export default async function InvitePage({ params, searchParams }: Props) {
  const { token } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();
  const [{ data }, account] = await Promise.all([
    supabase.rpc("invitation_preview", { invite_token: token }),
    getAccount(),
  ]);
  const invite = data?.[0];
  const here = `/invite/${encodeURIComponent(token)}`;

  if (!invite || invite.expired || invite.accepted) {
    return (
      <Card className="text-center">
        <CardHeader className="items-center">
          <CardTitle as="h1">Invitation not available</CardTitle>
          <CardDescription>
            {invite?.accepted
              ? "This invitation has already been used."
              : invite?.expired
                ? "This invitation has expired. Ask your team for a new link."
                : "This link isn't valid. Check you copied all of it, or ask for a new one."}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href={account ? "/dashboard" : "/"}>{account ? "Go to your dashboard" : "Go to OCHWORLD"}</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const wrongEmail = account?.email && account.email.toLowerCase() !== invite.email.toLowerCase();

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <span className="mb-2 grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
          <Users className="size-6" aria-hidden="true" />
        </span>
        <CardTitle as="h1">Join {invite.organization_name}</CardTitle>
        <CardDescription>
          You&apos;ve been invited to join as {ROLE_LABELS[invite.role]}. The invitation is for{" "}
          <span className="font-semibold text-foreground">{invite.email}</span>.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && <FormAlert state={{ type: "error", message: ERRORS[error] ?? ERRORS.invalid }} />}
        {wrongEmail && (
          <FormAlert
            state={{
              type: "error",
              message: `You're signed in as ${account.email}. Sign out, then sign in or create an account with ${invite.email}.`,
            }}
          />
        )}
      </CardContent>

      <CardFooter className="flex-col gap-3">
        {!account ? (
          <>
            <Button asChild className="w-full">
              <Link href={`/sign-in?next=${encodeURIComponent(here)}`}>Sign in to accept</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/sign-up?next=${encodeURIComponent(here)}`}>Create an account</Link>
            </Button>
          </>
        ) : wrongEmail ? (
          <form action="/auth/sign-out" method="post" className="w-full">
            <Button type="submit" variant="outline" className="w-full">
              Sign out
            </Button>
          </form>
        ) : (
          <form action={acceptInvitation} className="w-full">
            <input type="hidden" name="token" value={token} />
            <Button type="submit" className="w-full">
              Accept and join
            </Button>
          </form>
        )}
      </CardFooter>
    </Card>
  );
}
