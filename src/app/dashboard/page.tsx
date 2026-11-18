import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Heart, LogOut, MapPinned, Search } from "lucide-react";

import { AuthBackground } from "@/components/auth/auth-background";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

const shortcuts = [
  { icon: Search, title: "Explore Abuja", text: "Browse homes across every district." },
  { icon: Heart, title: "Saved homes", text: "Properties you've shortlisted." },
  { icon: MapPinned, title: "Area ratings", text: "Security, power and roads by district." },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/dashboard");

  const meta = user.user_metadata as { full_name?: string; name?: string; role?: string };
  const name = meta.full_name ?? meta.name ?? user.email?.split("@")[0] ?? "there";
  const role = meta.role === "agent" ? "Agent / Landlord" : "Home seeker";
  const provider = (user.app_metadata.provider as string | undefined) ?? "email";

  return (
    <div className="relative min-h-dvh">
      <AuthBackground />

      <header className="glass-soft sticky top-0 z-10 border-x-0 border-t-0 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <Logo href="/dashboard" />
          <form action="/auth/sign-out" method="post">
            <Button type="submit" variant="glass" size="sm">
              <LogOut /> Sign out
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-12 sm:px-8">
        <Card>
          <CardHeader>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">Welcome</p>
            <CardTitle className="text-3xl sm:text-4xl">
              Hello, <span className="text-gold-gradient">{name.split(" ")[0]}</span>
            </CardTitle>
            <CardDescription>
              Signed in as {user.email} · {role} · via {provider.charAt(0).toUpperCase() + provider.slice(1)}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {shortcuts.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="transition-colors hover:border-gold-500/30">
              <CardContent className="space-y-3 pt-6 sm:pt-8">
                <span className="grid size-11 place-items-center rounded-xl bg-gold-500/15 text-gold-300 ring-1 ring-gold-500/30">
                  <Icon className="size-5" />
                </span>
                <p className="font-display text-lg font-bold">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
