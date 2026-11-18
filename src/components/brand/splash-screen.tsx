"use client";

import * as React from "react";
import { BrandLoader, LoaderBar } from "@/components/brand/loader";
import { cn } from "@/lib/utils";

const MIN_VISIBLE_MS = 1100;
const SEEN_KEY = "och_splash_seen";

/**
 * Branded splash on the first visit of a browser session.
 * Fades out once the page has loaded (and after at least ~1s so it doesn't flash).
 * A CSS fallback (animate-splash-out) hides it even if JavaScript fails.
 */
export function SplashScreen() {
  const [phase, setPhase] = React.useState<"show" | "hide" | "gone">("show");

  React.useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage blocked: just show it */
    }
    if (seen) {
      setPhase("gone");
      return;
    }

    const start = performance.now();
    const timers: ReturnType<typeof setTimeout>[] = [];
    const finish = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - start));
      timers.push(
        setTimeout(() => {
          setPhase("hide");
          timers.push(setTimeout(() => setPhase("gone"), 500));
        }, wait)
      );
    };

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });

    return () => {
      window.removeEventListener("load", finish);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden={phase === "hide"}
      className={cn(
        "fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-background transition-opacity duration-500 animate-splash-out",
        phase === "hide" && "pointer-events-none opacity-0"
      )}
    >
      <div className="absolute -left-32 -top-32 size-[30rem] rounded-full bg-gold-400/35 blur-[110px]" />
      <div className="absolute -bottom-40 -right-24 size-[34rem] rounded-full bg-ember-500/30 blur-[120px]" />

      <div className="relative flex flex-col items-center gap-6">
        <BrandLoader label="" size="lg" />
        <div className="text-center">
          <p className="font-display text-2xl font-extrabold tracking-[0.28em] text-gold-gradient">OCHWORLD</p>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">Live Abuja</p>
        </div>
        <LoaderBar />
      </div>
    </div>
  );
}
