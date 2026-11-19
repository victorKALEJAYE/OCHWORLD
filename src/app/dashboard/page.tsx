import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Placeholder signed-in page. Role-specific dashboards (seeker, agent, landlord,
 * super admin) are built in Phases 5–6 on top of the tenant model from Phase 4.
 *
 * Note: the account type is deliberately NOT read from `user_metadata` here.
 * Users can edit their own metadata, so it must never drive access or labels
 * that imply access. Roles will come from the memberships tables in Phase 4.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/dashboard");

  const meta = user.user_metadata as { full_name?: string; name?: string };
  const firstName = (meta.full_name ?? meta.name ?? "").split(" ")[0] || "there";

  return (
    <div className="min-h-dvh bg-surface">
      <header className="border-b bg-background pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
          <Logo href="/dashboard" />
          <form action="/auth/sign-out" method="post">
            <Button type="submit" variant="outline" size="sm">
              <LogOut /> Sign out
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-content space-y-8 px-4 py-10 sm:px-6">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold">Hello, {firstName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.email}</p>
        </div>

        <EmptyState
          className="bg-background"
          icon={LayoutDashboard}
          title="Your dashboard is being set up"
          description="Saved homes, enquiries and listing tools will appear here as they are released."
        />
      </main>
    </div>
  );
}
