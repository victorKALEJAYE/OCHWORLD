import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/sign-in-form";
import { safeNextPath } from "@/lib/validations/auth";

export const metadata: Metadata = { title: "Sign in" };

const errorMessages: Record<string, string> = {
  auth: "We couldn't finish signing you in. Please try again.",
  expired: "That link has expired. Request a new one.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  return <SignInForm next={safeNextPath(next)} initialError={error ? errorMessages[error] ?? errorMessages.auth : undefined} />;
}
