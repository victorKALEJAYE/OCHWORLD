"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AccountTypeToggle } from "@/components/auth/account-type-toggle";
import { FormAlert, type AlertState } from "@/components/auth/form-alert";
import { FormField } from "@/components/auth/form-field";
import { OAuthButtons, OrDivider } from "@/components/auth/oauth-buttons";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { CheckEmailCard } from "@/components/auth/check-email-card";
import { createClient, getSiteUrl } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/auth/errors";
import { signUpSchema, type SignUpValues } from "@/lib/validations/auth";

export function SignUpForm({
  defaultAccountType = "seeker",
  next,
}: {
  defaultAccountType?: SignUpValues["accountType"];
  /** Where to go after sign-up instead of onboarding, e.g. a team invitation. Must be a safe local path. */
  next?: string;
}) {
  const router = useRouter();
  const [alert, setAlert] = React.useState<AlertState>(null);
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      accountType: defaultAccountType,
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const password = watch("password");
  // Account type is only a starting point for onboarding; it grants nothing.
  const onboardingPath = next ?? `/onboarding?type=${watch("accountType") === "agent" ? "agency" : "seeker"}`;

  async function onSubmit(values: SignUpValues) {
    setAlert(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(onboardingPath)}`,
          // Display details only. Roles come from organization membership, never from metadata.
          data: {
            full_name: values.fullName,
            phone: values.phone || null,
          },
        },
      });
      if (error) throw error;

      if (data.session) {
        // Email confirmation is off in Supabase: the user is signed in already.
        router.replace(onboardingPath);
        router.refresh();
      } else {
        setSentTo(values.email);
      }
    } catch (err) {
      setAlert({ type: "error", message: friendlyAuthError(err) });
    }
  }

  if (sentTo) return <CheckEmailCard email={sentTo} />;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle as="h1">Create your account</CardTitle>
        <CardDescription>Join OCHWORLD and find your place in Abuja.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <OAuthButtons next={onboardingPath} disabled={isSubmitting} onError={(message) => setAlert({ type: "error", message })} />
        <OrDivider label="or sign up with email" />

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <FormAlert state={alert} />

          <Controller
            control={control}
            name="accountType"
            render={({ field }) => <AccountTypeToggle value={field.value} onChange={field.onChange} />}
          />

          <FormField id="fullName" label="Full name" error={errors.fullName?.message}>
            <Input
              id="fullName"
              autoComplete="name"
              placeholder="Adaeze Okafor"
              aria-invalid={!!errors.fullName}
              {...register("fullName")}
            />
          </FormField>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField id="email" label="Email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
            </FormField>

            <FormField id="phone" label="Phone (optional)" error={errors.phone?.message}>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="0803 000 0000"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
            </FormField>
          </div>

          <FormField
            id="password"
            label="Password"
            error={errors.password?.message}
            hint="At least 8 characters, with a letter and a number."
          >
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Create a password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </FormField>
          <PasswordStrength password={password} />

          <FormField id="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message}>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Type it again"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
          </FormField>

          <div className="space-y-2">
            <Controller
              control={control}
              name="acceptTerms"
              render={({ field }) => (
                <label htmlFor="acceptTerms" className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
                  <Checkbox
                    id="acceptTerms"
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(v === true)}
                    className="mt-0.5"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms" className="link">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="link">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              )}
            />
            {errors.acceptTerms && <p className="text-xs font-medium text-destructive">{errors.acceptTerms.message}</p>}
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : null}
            {isSubmitting ? "Creating account…" : "Create account"}
            {!isSubmitting && <ArrowRight />}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="link">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
