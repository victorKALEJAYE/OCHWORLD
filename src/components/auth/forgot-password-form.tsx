"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckEmailCard } from "@/components/auth/check-email-card";
import { FormAlert, type AlertState } from "@/components/auth/form-alert";
import { FormField } from "@/components/auth/form-field";
import { createClient, getSiteUrl } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/auth-errors";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/lib/validations/auth";

export function ForgotPasswordForm() {
  const [alert, setAlert] = React.useState<AlertState>(null);
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit({ email }: ForgotPasswordValues) {
    setAlert(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getSiteUrl()}/auth/callback?next=/update-password`,
      });
      if (error) throw error;
      setSentTo(email);
    } catch (err) {
      setAlert({ type: "error", message: friendlyAuthError(err) });
    }
  }

  if (sentTo) return <CheckEmailCard email={sentTo} title="Reset link sent" />;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle as="h1">Forgot your password?</CardTitle>
        <CardDescription>Enter your email and we&apos;ll send you a link to set a new one.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <FormAlert state={alert} />
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
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Link href="/sign-in" className="link inline-flex items-center gap-2 text-sm">
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
