"use client";

import { startTransition, useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { FormAlert } from "@/components/auth/form-alert";
import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Input, fieldClasses } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requestLegalHelp, type LegalRequestState } from "@/lib/legal/actions";
import { LEGAL_SERVICES, type LegalService } from "@/lib/legal/constants";
import { cn } from "@/lib/utils";

type LegalRequestFormProps = {
  defaultService?: LegalService;
  /** When the request is about an OCHWORLD listing. */
  property?: { id: string; title: string; district: string };
  defaultName?: string;
  defaultEmail?: string;
};

/**
 * Request for property legal help. Works for guests. Validated again on the
 * server (lib/validations/legal.ts); submitted via onSubmit so React keeps
 * what was typed if the server sends back errors.
 */
export function LegalRequestForm({ defaultService, property, defaultName, defaultEmail }: LegalRequestFormProps) {
  const [state, formAction, pending] = useActionState<LegalRequestState, FormData>(requestLegalHelp, {
    status: "idle",
  });

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-center gap-2 rounded-lg border bg-background px-6 py-10 text-center">
        <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
        <p className="text-lg font-semibold">Request received</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          We&apos;ll call or email you to confirm the details and the lawyer&apos;s quote before any work starts.
          {defaultEmail ? " You can follow it from your dashboard." : ""}
        </p>
      </div>
    );
  }

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="space-y-4"
      noValidate
    >
      {property && <input type="hidden" name="propertyId" value={property.id} />}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.status === "error" && <FormAlert state={{ type: "error", message: state.message }} />}

      <FormField id="legal-service" label="What do you need?" error={errors.service}>
        <Select id="legal-service" name="service" defaultValue={defaultService ?? ""} aria-invalid={!!errors.service} required>
          <option value="" disabled>
            Choose a service…
          </option>
          {LEGAL_SERVICES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.title}
            </option>
          ))}
        </Select>
      </FormField>

      {property ? (
        <div className="rounded-md border bg-surface px-4 py-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Property</p>
          <p className="mt-1 font-semibold">{property.title}</p>
          <p className="text-muted-foreground">{property.district}</p>
        </div>
      ) : (
        <FormField
          id="legal-property"
          label="Which property?"
          error={errors.propertyDetails}
          hint="Address, plot number or district, as much as you know."
        >
          <Input id="legal-property" name="propertyDetails" maxLength={500} aria-invalid={!!errors.propertyDetails} />
        </FormField>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="legal-name" label="Name" error={errors.name}>
          <Input id="legal-name" name="name" autoComplete="name" defaultValue={defaultName} aria-invalid={!!errors.name} required />
        </FormField>
        <FormField id="legal-phone" label="Phone" error={errors.phone}>
          <Input id="legal-phone" name="phone" type="tel" autoComplete="tel" placeholder="0803 000 0000" aria-invalid={!!errors.phone} required />
        </FormField>
      </div>
      <FormField id="legal-email" label="Email" error={errors.email}>
        <Input id="legal-email" name="email" type="email" autoComplete="email" defaultValue={defaultEmail} aria-invalid={!!errors.email} required />
      </FormField>
      <FormField id="legal-message" label="Anything else? (optional)" error={errors.message}>
        <textarea
          id="legal-message"
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="e.g. The seller says the C of O is being processed. I want to pay a deposit next week."
          className={cn(fieldClasses, "h-auto resize-y py-2.5")}
        />
      </FormField>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        {pending ? "Sending…" : "Request legal help"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Free to ask. You only pay if you accept the lawyer&apos;s quote.
      </p>
    </form>
  );
}
