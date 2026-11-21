import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { safeNextPath } from "@/lib/validations/auth";

export const metadata: Metadata = { title: "Create account" };

type Props = { searchParams: Promise<{ type?: string; next?: string }> };

/**
 * `?type=agent` (from "List a property") pre-selects the agent/landlord account type.
 * `?next=/invite/...` returns invited teammates to their invitation instead of onboarding.
 */
export default async function SignUpPage({ searchParams }: Props) {
  const { type, next } = await searchParams;
  return (
    <SignUpForm
      defaultAccountType={type === "agent" ? "agent" : "seeker"}
      next={next ? safeNextPath(next) : undefined}
    />
  );
}
