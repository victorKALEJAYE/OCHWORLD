"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Copy, Loader2, MessageCircle } from "lucide-react";
import { FormAlert } from "@/components/auth/form-alert";
import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { createInvitation, type InviteState } from "@/lib/team/actions";

/** Owners and admins invite teammates. The result is a link to share however they like. */
export function InviteForm({ organizationId, organizationName }: { organizationId: string; organizationName: string }) {
  const [state, formAction, pending] = useActionState<InviteState, FormData>(createInvitation, { status: "idle" });

  return (
    <div className="space-y-4">
      <form action={formAction} className="grid gap-4 sm:grid-cols-[1fr_10rem_auto] sm:items-end" noValidate>
        <input type="hidden" name="organizationId" value={organizationId} />
        <FormField id="invite-email" label="Email address">
          <Input id="invite-email" name="email" type="email" autoComplete="off" placeholder="name@example.com" required />
        </FormField>
        <FormField id="invite-role" label="Role">
          <Select id="invite-role" name="role" defaultValue="agent">
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </Select>
        </FormField>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          Create invite link
        </Button>
      </form>

      {state.status === "error" && <FormAlert state={{ type: "error", message: state.message }} />}
      {state.status === "created" && (
        <InviteLink token={state.token} email={state.email} organizationName={organizationName} />
      )}
    </div>
  );
}

export function InviteLink({ token, email, organizationName }: { token: string; email?: string; organizationName: string }) {
  const [copied, setCopied] = useState(false);
  // The full address is only known in the browser; render the path first to match the server HTML.
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const url = `${origin}/invite/${token}`;
  const message = `You've been invited to join ${organizationName} on OCHWORLD. Accept here: ${url}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-success/40 bg-success/10 p-4 text-sm">
      {email && (
        <p>
          Invite link for <strong className="font-semibold">{email}</strong>. They must sign in or sign up with this
          email. The link works once and expires in 14 days.
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input readOnly value={url} aria-label="Invite link" onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" />
        <Button type="button" variant="outline" onClick={copy}>
          {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
        </Button>
        <Button asChild variant="outline">
          <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle /> WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
