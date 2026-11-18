"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const LETTERS = "OCHWORLD".split("");

/**
 * The OCHWORLD letters drift in from spread-out positions, unblur and settle
 * together into the wordmark, one after another.
 */
export function AnimatedWordmark({
  className,
  delay = 0,
  stagger = 110,
}: {
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const mid = (LETTERS.length - 1) / 2;
  return (
    <p
      aria-label="OCHWORLD"
      className={cn("flex font-display text-3xl font-extrabold tracking-[0.22em] sm:text-4xl", className)}
    >
      {LETTERS.map((ch, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="inline-block animate-letter-in bg-gradient-to-b from-gold-100 via-gold-300 to-gold-600 bg-clip-text text-transparent"
          style={
            {
              "--from-x": `${(i - mid) * 22}px`,
              animationDelay: `${delay + i * stagger}ms`,
            } as React.CSSProperties
          }
        >
          {ch}
        </span>
      ))}
    </p>
  );
}

const sizes = { sm: 48, md: 72, lg: 96 } as const;

type BrandLoaderProps = {
  label?: string;
  size?: keyof typeof sizes;
  className?: string;
};

/** OCHWORLD mark inside a slowly turning gold ring. */
export function BrandLoader({ label = "Loading", size = "md", className }: BrandLoaderProps) {
  const px = sizes[size];
  const ring = size === "sm" ? 2 : 3;
  const mask = `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 calc(100% - ${ring}px))`;

  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col items-center gap-5", className)}>
      <div className="relative" style={{ width: px, height: px }}>
        <div className="absolute -inset-3 rounded-full bg-gold-500/15 blur-2xl animate-pulse-soft" />
        <div className="absolute inset-0 rounded-full border-white/10" style={{ borderWidth: ring, borderStyle: "solid" }} />
        <div
          className="absolute inset-0 animate-spin rounded-full [animation-duration:2.4s] [animation-timing-function:cubic-bezier(0.45,0.05,0.55,0.95)]"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, rgba(246,210,122,0.9) 160deg, #D7A328 260deg, transparent 360deg)",
            WebkitMask: mask,
            mask,
          }}
        />
        <Image
          src="/ochworld-mark.png"
          alt=""
          width={px}
          height={px}
          priority
          className="absolute inset-[22%] size-[56%] object-contain animate-pulse-soft"
        />
      </div>

      {label ? (
        <p className="flex items-baseline gap-1 text-sm font-medium tracking-wide text-gold-100/80 animate-fade-up">
          {label}
          <span className="inline-flex gap-1" aria-hidden="true">
            {[0, 400, 800].map((d) => (
              <span
                key={d}
                className="size-1 rounded-full bg-gold-300 animate-pulse-soft"
                style={{ animationDelay: `${d}ms` }}
              />
            ))}
          </span>
        </p>
      ) : (
        <span className="sr-only">Loading</span>
      )}
    </div>
  );
}

/** Slow, smooth indeterminate gold progress bar. */
export function LoaderBar({ className }: { className?: string }) {
  return (
    <div className={cn("h-[3px] w-40 overflow-hidden rounded-full bg-white/10", className)}>
      <div className="h-full w-2/5 animate-progress rounded-full bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
    </div>
  );
}
