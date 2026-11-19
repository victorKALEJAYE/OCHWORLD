"use client";

import { useActionState, useState } from "react";
import { Briefcase, Building, Home, KeyRound, Loader2 } from "lucide-react";
import { FormAlert } from "@/components/auth/form-alert";
import { FormField } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { completeOnboarding, type OnboardingState } from "@/lib/auth/actions";
import type { OnboardingAccountType } from "@/lib/validations/onboarding";
import { cn } from "@/lib/utils";

const options: { value: OnboardingAccountType; label: string; text: string; Icon: typeof Home }[] = [
  { value: "seeker", label: "Looking for a property", text: "Buy, rent or save homes", Icon: Home },
  { value: "agency", label: "Estate agency", text: "List for clients, add your team", Icon: Briefcase },
  { value: "landlord", label: "Landlord", text: "Rent or sell your own property", Icon: KeyRound },
  { value: "developer", label: "Developer", text: "Market new developments", Icon: Building },
];

const nameLabel: Record<Exclude<OnboardingAccountType, "seeker">, string> = {
  agency: "Agency name",
  landlord: "Your name or company name",
  developer: "Company name",
};

export function OnboardingForm({
  defaultType = "seeker",
  defaultName,
}: {
  defaultType?: OnboardingAccountType;
  defaultName?: string;
}) {
  const [type, setType] = useState<OnboardingAccountType>(defaultType);
  const [state, formAction, pending] = useActionState<OnboardingState, FormData>(completeOnboarding, {
    status: "idle",
  });
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const professional = type !== "seeker";

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle as="h1">One last step</CardTitle>
        <CardDescription>Tell us how you&apos;ll use OCHWORLD so we can set up your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state.status === "error" && <FormAlert state={{ type: "error", message: state.message }} />}

          <fieldset className="grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Account type</legend>
            {options.map(({ value, label, text, Icon }) => (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                  type === value ? "border-primary bg-primary/10" : "border-input hover:bg-muted"
                )}
              >
                <input
                  type="radio"
                  name="accountType"
                  value={value}
                  checked={type === value}
                  onChange={() => setType(value)}
                  className="sr-only"
                />
                <Icon className={cn("mt-0.5 size-5 shrink-0", type === value ? "text-primary" : "text-muted-foreground")} />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs text-muted-foreground">{text}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {professional && (
            <div className="space-y-5">
              <FormField id="organizationName" label={nameLabel[type]} error={errors.organizationName}>
                <Input
                  id="organizationName"
                  name="organizationName"
                  defaultValue={type === "landlord" ? defaultName : undefined}
                  aria-invalid={!!errors.organizationName}
                  required
                />
              </FormField>
              <FormField
                id="organizationPhone"
                label="Business phone (optional)"
                error={errors.organizationPhone}
                hint={type === "landlord" ? "Never shown publicly. Tenants contact you through enquiries." : "Shown on your listings."}
              >
                <Input
                  id="organizationPhone"
                  name="organizationPhone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="0803 000 0000"
                  aria-invalid={!!errors.organizationPhone}
                />
              </FormField>
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            {pending ? "Setting up…" : "Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
