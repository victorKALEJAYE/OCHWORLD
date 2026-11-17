/** Turns Supabase error messages into friendly copy. */
export function friendlyAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const m = message.toLowerCase();

  if (m.includes("isn't configured")) return message;
  if (m.includes("invalid login credentials")) return "That email and password don't match. Try again or reset your password.";
  if (m.includes("email not confirmed")) return "Confirm your email first. Check your inbox for the link we sent.";
  if (m.includes("already registered") || m.includes("already been registered")) return "An account with this email already exists. Sign in instead.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Wait a minute and try again.";
  if (m.includes("provider is not enabled") || m.includes("unsupported provider")) return "This sign-in option isn't switched on yet. Enable it in Supabase → Authentication → Providers.";
  if (m.includes("same password") || m.includes("different from the old")) return "Choose a password you haven't used before.";
  if (m.includes("fetch")) return "Can't reach the server. Check your connection and try again.";
  return message || "Something went wrong. Please try again.";
}
