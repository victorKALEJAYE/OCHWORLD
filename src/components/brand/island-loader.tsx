"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatedWordmark } from "@/components/brand/loader";
import { cn } from "@/lib/utils";

type Phase = "hidden" | "pill" | "open" | "shrink" | "fade";

/** Apple-like spring curve used by the real Dynamic Island. */
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

type IslandLoaderProps = {
  /** Show while true; when it turns false the island shrinks back and fades. */
  active: boolean;
  /** Short status line, e.g. "Signing you in". */
  label?: string;
  /** Show the OCHWORLD letters gliding together inside the island. */
  showWordmark?: boolean;
  /** Dim the page behind and block clicks while loading. */
  dim?: boolean;
};

/**
 * A loader styled like the iPhone Dynamic Island: a black pill at the top of
 * the screen that springs open into a wide "live activity", then shrinks back.
 * It sits below the phone's real notch / Dynamic Island using the safe-area inset.
 */
export function IslandLoader({ active, label = "Loading", showWordmark = true, dim = true }: IslandLoaderProps) {
  const [mounted, setMounted] = React.useState(false);
  const [phase, setPhase] = React.useState<Phase>("hidden");

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (active) {
      setPhase("pill");
      timers.push(setTimeout(() => setPhase("open"), 420));
    } else {
      setPhase((p) => (p === "hidden" ? "hidden" : "shrink"));
      timers.push(setTimeout(() => setPhase((p) => (p === "shrink" ? "fade" : p)), 520));
      timers.push(setTimeout(() => setPhase((p) => (p === "fade" ? "hidden" : p)), 820));
    }
    return () => timers.forEach(clearTimeout);
  }, [active]);

  if (!mounted || phase === "hidden") return null;

  const open = phase === "open";

  return createPortal(
    <div className={cn("fixed inset-0 z-[110]", !dim && "pointer-events-none")} role="status" aria-live="polite">
      <span className="sr-only">{label}</span>

      {dim && (
        <div
          className={cn(
            "absolute inset-0 bg-background/55 backdrop-blur-[3px] transition-opacity duration-500",
            open ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* sits just under the phone's own notch / Dynamic Island */}
      <div
        className="absolute inset-x-0 flex justify-center"
        style={{ top: "max(12px, calc(env(safe-area-inset-top, 0px) + 8px))" }}
      >
        <div
          className="relative overflow-hidden bg-black text-white ring-1 ring-white/[0.08] animate-in fade-in zoom-in-90 duration-300"
          style={{
            width: open ? "min(360px, calc(100vw - 24px))" : 128,
            height: open ? 76 : 38,
            borderRadius: open ? 30 : 999,
            opacity: phase === "fade" ? 0 : 1,
            transform: phase === "fade" ? "scale(0.9)" : "scale(1)",
            boxShadow: open
              ? "0 18px 50px -12px rgba(0,0,0,0.8), 0 0 40px -14px rgba(215,163,40,0.45)"
              : "0 8px 24px -10px rgba(0,0,0,0.8)",
            transition: `width 650ms ${EASE}, height 650ms ${EASE}, border-radius 650ms ${EASE}, box-shadow 650ms ${EASE}, opacity 280ms ease, transform 280ms ease`,
          }}
        >
          {/* collapsed: tiny gold activity dot, like a live activity */}
          <span
            className={cn(
              "absolute right-4 top-1/2 size-2 -translate-y-1/2 rounded-full bg-gold-400 shadow-[0_0_10px_rgba(232,188,79,0.9)] animate-pulse-soft transition-opacity duration-200",
              open ? "opacity-0" : "opacity-100"
            )}
          />

          {/* expanded content */}
          <div
            className={cn(
              "absolute inset-0 flex items-center gap-3.5 pl-3.5 pr-5 transition-opacity",
              open ? "opacity-100 delay-200 duration-300" : "opacity-0 duration-150"
            )}
          >
            <IslandSpinner />

            <div className="min-w-0 flex-1">
              {open && showWordmark ? (
                <AnimatedWordmark className="text-[15px] tracking-[0.32em] sm:text-base" delay={150} stagger={75} />
              ) : (
                <p className="font-display text-[15px] font-bold tracking-[0.18em] text-gold-200">OCHWORLD</p>
              )}
              <p className="mt-0.5 truncate text-[12px] text-white/55">{label}</p>
            </div>

            <span className="flex gap-1" aria-hidden="true">
              {[0, 300, 600].map((d) => (
                <span
                  key={d}
                  className="size-1.5 rounded-full bg-gold-400/90 animate-pulse-soft"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Small OCHWORLD mark inside a turning gold ring, sized for the island. */
function IslandSpinner() {
  const mask = "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))";
  return (
    <div className="relative size-12 shrink-0">
      <div className="absolute inset-0 rounded-full border-2 border-white/10" />
      <div
        className="absolute inset-0 animate-spin rounded-full [animation-duration:2.4s]"
        style={{
          background: "conic-gradient(from 0deg, transparent 0deg, rgba(246,210,122,0.9) 160deg, #D7A328 260deg, transparent 360deg)",
          WebkitMask: mask,
          mask,
        }}
      />
      <Image src="/ochworld-mark.png" alt="" width={48} height={48} className="absolute inset-[24%] size-[52%] object-contain" />
    </div>
  );
}
