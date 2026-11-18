"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatedWordmark, LoaderBar } from "@/components/brand/loader";
import { cn } from "@/lib/utils";

/** Long enough for the letters to finish settling, on fast and slow phones alike. */
const MIN_VISIBLE_MS = 2800;
const FADE_MS = 700;
const SEEN_KEY = "och_splash_seen";

/**
 * Branded splash on the first visit of a browser session:
 * the logo fades up, the OCHWORLD letters glide together, then it fades away.
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
          timers.push(setTimeout(() => setPhase("gone"), FADE_MS));
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
        "fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-background transition-opacity ease-out animate-splash-out",
        phase === "hide" && "pointer-events-none opacity-0"
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <div className="absolute left-1/2 top-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/10 blur-[120px]" />

      <div className="relative flex flex-col items-center gap-6 px-6">
        <Image
          src="/ochworld-mark.png"
          alt=""
          width={72}
          height={72}
          priority
          className="size-16 object-contain animate-fade-up sm:size-[72px]"
        />
        <AnimatedWordmark delay={350} />
        <p
          className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground animate-fade-up"
          style={{ animationDelay: "1500ms" }}
        >
          Live Abuja
        </p>
        <div className="animate-fade-up" style={{ animationDelay: "1700ms" }}>
          <LoaderBar />
        </div>
      </div>
    </div>
  );
}
