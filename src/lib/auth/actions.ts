"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validations/onboarding";

export type OnboardingState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Partial<Record<string, string>> };

/**
 * Finishes sign-up by calling the `complete_onboarding` database function,
 * which creates the organization and owner membership atomically for
 * professionals. The database enforces the rules; this action only translates
 * results into messages.
 */
export async function completeOnboarding(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const parsed = onboardingSchema.safeParse({
    accountType: formData.get("accountType"),
    organizationName: formData.get("organizationName") ?? undefined,
    organizationPhone: formData.get("organizationPhone") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0]])
    );
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors };
  }

  const supabase = await createClient();
  const values = parsed.data;
  const { error } = await supabase.rpc(
    "complete_onboarding",
    values.accountType === "seeker"
      ? { account_type: "seeker" }
      : {
          account_type: values.accountType,
          organization_name: values.organizationName,
          organization_phone: values.organizationPhone,
        }
  );

  if (error) {
    // 23505: the user already owns an organization (e.g. a double submit after success).
    if (error.code === "23505") redirect("/dashboard");
    if (error.code === "42501") redirect("/sign-in?next=/onboarding");
    console.error("completeOnboarding failed", error);
    return { status: "error", message: "We couldn't finish setting up your account. Please try again." };
  }

  redirect("/dashboard");
}
