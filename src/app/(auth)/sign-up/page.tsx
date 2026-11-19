import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "Create account" };

type Props = { searchParams: Promise<{ type?: string }> };

/** `?type=agent` (from "List a property") pre-selects the agent/landlord account type. */
export default async function SignUpPage({ searchParams }: Props) {
  const { type } = await searchParams;
  return <SignUpForm defaultAccountType={type === "agent" ? "agent" : "seeker"} />;
}
