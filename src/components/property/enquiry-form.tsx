"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { FormAlert } from "@/components/auth/form-alert";
import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Input, fieldClasses } from "@/components/ui/input";
import { sendEnquiry, type EnquiryState } from "@/lib/properties/actions";
import { cn } from "@/lib/utils";

type EnquiryFormProps = {
  propertyId: string;
  propertyTitle: string;
  /** Pre-filled for signed-in users. */
  defaultName?: string;
  defaultEmail?: string;
};

/**
 * Contact form on the property page. Guests can use it without an account.
 * Validation runs again on the server (lib/validations/enquiry.ts) and the
 * database rejects enquiries on listings that aren't published.
 */
export function EnquiryForm({ propertyId, propertyTitle, defaultName, defaultEmail }: EnquiryFormProps) {
  const [state, formAction, pending] = useActionState<EnquiryState, FormData>(sendEnquiry, { status: "idle" });

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-center gap-2 rounded-md border px-4 py-8 text-center">
        <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
        <p className="font-semibold">Message sent</p>
        <p className="text-sm text-muted-foreground">The agent will reply to you by email or phone.</p>
      </div>
    );
  }

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="propertyId" value={propertyId} />
      {/* Honeypot for spam bots: hidden from people and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" && <FormAlert state={{ type: "error", message: state.message }} />}

      <FormField id="enq-name" label="Name" error={errors.name}>
        <Input id="enq-name" name="name" autoComplete="name" defaultValue={defaultName} aria-invalid={!!errors.name} required />
      </FormField>
      <FormField id="enq-email" label="Email" error={errors.email}>
        <Input
          id="enq-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={defaultEmail}
          aria-invalid={!!errors.email}
          required
        />
      </FormField>
      <FormField id="enq-phone" label="Phone (optional)" error={errors.phone}>
        <Input id="enq-phone" name="phone" type="tel" autoComplete="tel" placeholder="0803 000 0000" aria-invalid={!!errors.phone} />
      </FormField>
      <FormField id="enq-message" label="Message" error={errors.message}>
        <textarea
          id="enq-message"
          name="message"
          rows={4}
          required
          defaultValue={`Hello, I'm interested in "${propertyTitle}". Is it still available?`}
          aria-invalid={!!errors.message}
          className={cn(fieldClasses, "h-auto resize-y py-2.5")}
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        {pending ? "Sending…" : "Send enquiry"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">Your details are shared only with this agent.</p>
    </form>
  );
}
