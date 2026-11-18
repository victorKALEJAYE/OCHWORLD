"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatedWordmark, LoaderBar } from "@/components/brand/loader";
import { IslandLoader } from "@/components/brand/island-loader";
import { cn } from "@/lib/utils";

/** Long enough for the letters to settle and the brand to sit on screen for 5 seconds. */
const MIN_VISIBLE_MS = 5000;
const FADE_MS = 700;
const SEEN_KEY = "och_splash_seen";

/**
 * Branded splash on the first visit of a browser session:
 * the logo fades up, the OCHWORLD letters glide together, then it fades away.
 * A CSS fallback (animate-splash-out) hides it even if JavaScript fails.
 */
export function SplashScreen() {
  const [phase, setPhase] = React.useState<"show" | "hide" | "gone">("show");
  const [island, setIsland] = React.useState(false);

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
    // Dynamic Island springs open just after the splash appears…
    timers.push(setTimeout(() => setIsland(true), 250));
    const finish = () => {
      const wait = Math.max(0, MIN_VISIBLE_MS - (performance.now() - start));
      // …and tucks itself away just before the splash fades.
      timers.push(setTimeout(() => setIsland(false), Math.max(0, wait - 900)));
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

      <IslandLoader active={island && phase === "show"} label="Getting things ready" showWordmark={false} dim={false} />

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
