"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormAlert, type AlertState } from "@/components/auth/form-alert";
import { FormField } from "@/components/auth/form-field";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/auth/errors";
import { updatePasswordSchema, type UpdatePasswordValues } from "@/lib/validations/auth";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [alert, setAlert] = React.useState<AlertState>(null);

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit({ password }: UpdatePasswordValues) {
    setAlert(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setAlert({ type: "success", message: "Password updated. Taking you to your dashboard…" });
      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1200);
    } catch (err) {
      setAlert({ type: "error", message: friendlyAuthError(err) });
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle as="h1">Set a new password</CardTitle>
        <CardDescription>Choose a strong password you haven&apos;t used before.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <FormAlert state={alert} />
          <FormField id="password" label="New password" error={errors.password?.message}>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
          </FormField>
          <PasswordStrength password={watch("password")} />
          <FormField id="confirmPassword" label="Confirm new password" error={errors.confirmPassword?.message}>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
          </FormField>
          <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? "Saving…" : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
