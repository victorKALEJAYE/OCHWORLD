import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/auth/onboarding-form";
import { requireAccount } from "@/lib/auth/account";
import { ONBOARDING_ACCOUNT_TYPES, type OnboardingAccountType } from "@/lib/validations/onboarding";

export const metadata: Metadata = { title: "Set up your account" };

type Props = { searchParams: Promise<{ type?: string }> };

/**
 * Every new account passes through here once (email, Google and Apple alike),
 * because OAuth sign-ups never see the sign-up form's account-type choice.
 */
export default async function OnboardingPage({ searchParams }: Props) {
  const account = await requireAccount("/onboarding");
  if (account.onboarded) redirect("/dashboard");

  const { type } = await searchParams;
  const defaultType = ONBOARDING_ACCOUNT_TYPES.includes(type as OnboardingAccountType)
    ? (type as OnboardingAccountType)
    : "seeker";

  return <OnboardingForm defaultType={defaultType} defaultName={account.name} />;
}
