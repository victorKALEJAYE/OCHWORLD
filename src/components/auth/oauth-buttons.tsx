"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppleIcon, GoogleIcon } from "@/components/icons";
import { FullScreenLoader } from "@/components/brand/loader";
import { createClient, getSiteUrl } from "@/lib/supabase/client";
import { friendlyAuthError } from "@/lib/auth-errors";

type Provider = "google" | "apple";

const providers: { id: Provider; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "google", label: "Google", Icon: GoogleIcon },
  { id: "apple", label: "Apple", Icon: AppleIcon },
];

type OAuthButtonsProps = {
  next?: string;
  disabled?: boolean;
  onError: (message: string) => void;
};

export function OAuthButtons({ next = "/dashboard", disabled, onError }: OAuthButtonsProps) {
  const [pending, setPending] = React.useState<Provider | null>(null);

  async function signInWith(provider: Provider) {
    setPending(provider);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}` },
      });
      if (error) throw error;
      // On success the browser leaves for Google/Apple, so keep the spinner.
    } catch (err) {
      onError(friendlyAuthError(err));
      setPending(null);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {pending && <FullScreenLoader label={`Connecting to ${pending === "google" ? "Google" : "Apple"}`} />}
      {providers.map(({ id, label, Icon }) => (
        <Button
          key={id}
          type="button"
          variant="glass"
          size="lg"
          disabled={disabled || pending !== null}
          onClick={() => signInWith(id)}
        >
          {pending === id ? <Loader2 className="animate-spin" /> : <Icon className="size-5" />}
          {label}
        </Button>
      ))}
    </div>
  );
}

export function OrDivider({ label = "or continue with email" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/15" />
      {label}
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/15" />
    </div>
  );
}
