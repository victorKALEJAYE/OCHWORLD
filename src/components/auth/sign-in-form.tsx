"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormAlert, type AlertState } from "@/components/auth/form-alert";
import { FormField } from "@/components/auth/form-field";
import { OAuthButtons, OrDivider } from "@/components/auth/oauth-buttons";
import { PasswordInput } from "@/components/auth/password-input";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/auth/errors";
import { signInSchema, type SignInValues } from "@/lib/validations/auth";

export function SignInForm({ next, initialError }: { next: string; initialError?: string }) {
  const router = useRouter();
  const [alert, setAlert] = React.useState<AlertState>(initialError ? { type: "error", message: initialError } : null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInValues) {
    setAlert(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) throw error;
      router.replace(next);
      router.refresh();
    } catch (err) {
      setAlert({ type: "error", message: friendlyAuthError(err) });
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle as="h1">Welcome back</CardTitle>
        <CardDescription>Sign in to save homes, book viewings and talk to agents.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <OAuthButtons next={next} disabled={isSubmitting} onError={(message) => setAlert({ type: "error", message })} />
        <OrDivider />

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <FormAlert state={alert} />

          <FormField id="email" label="Email" error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email")}
            />
          </FormField>

          <FormField
            id="password"
            label="Password"
            error={errors.password?.message}
            action={
              <Link href="/forgot-password" className="link text-xs">
                Forgot password?
              </Link>
            }
          >
            <PasswordInput
              id="password"
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
          </FormField>

          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : null}
            {isSubmitting ? "Signing in…" : "Sign in"}
            {!isSubmitting && <ArrowRight />}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-sm text-muted-foreground">
          New to OCHWORLD?{" "}
          <Link href={next === "/dashboard" ? "/sign-up" : `/sign-up?next=${encodeURIComponent(next)}`} className="link">
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
