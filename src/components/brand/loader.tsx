"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { cn } from "@/lib/utils";

const sizes = { sm: 48, md: 72, lg: 104 } as const;

type BrandLoaderProps = {
  label?: string;
  size?: keyof typeof sizes;
  className?: string;
};

/** OCHWORLD mark inside a spinning gold-to-ember ring. */
export function BrandLoader({ label = "Loading", size = "md", className }: BrandLoaderProps) {
  const px = sizes[size];
  const ring = size === "sm" ? 3 : 4;

  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col items-center gap-5", className)}>
      <div className="relative" style={{ width: px, height: px }}>
        {/* soft glow */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-gold-400/40 to-ember-500/30 blur-2xl animate-pulse-soft" />
        {/* faint track */}
        <div className="absolute inset-0 rounded-full border border-white/10" style={{ borderWidth: ring }} />
        {/* spinning gradient arc */}
        <div
          className="absolute inset-0 animate-spin rounded-full [animation-duration:1s]"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, #F6D27A 140deg, #D7A328 230deg, #E8892B 320deg, transparent 360deg)",
            WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 calc(100% - ${ring}px))`,
            mask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 calc(100% - ${ring}px))`,
          }}
        />
        {/* logo */}
        <Image
          src="/ochworld-mark.png"
          alt=""
          width={px}
          height={px}
          priority
          className="absolute inset-[22%] size-[56%] object-contain animate-pulse-soft"
        />
      </div>

      {label && (
        <p className="flex items-baseline gap-1 text-sm font-medium tracking-wide text-gold-100/90">
          {label}
          <span className="inline-flex gap-0.5" aria-hidden="true">
            {[0, 150, 300].map((d) => (
              <span
                key={d}
                className="size-1 animate-bounce rounded-full bg-gold-300"
                style={{ animationDelay: `${d}ms` }}
              />
            ))}
          </span>
        </p>
      )}
    </div>
  );
}

/** Indeterminate gold progress bar. */
export function LoaderBar({ className }: { className?: string }) {
  return (
    <div className={cn("h-1 w-48 overflow-hidden rounded-full bg-white/10", className)}>
      <div className="h-full w-1/2 animate-progress rounded-full bg-gradient-to-r from-gold-300 via-gold-500 to-ember-500" />
    </div>
  );
}

/**
 * Blurred overlay over the whole screen while something is happening
 * (signing in, creating an account, redirecting to Google/Apple).
 * Rendered in a portal so glass parents (backdrop-filter) can't clip it.
 */
export function FullScreenLoader({ label }: { label?: string }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] grid place-items-center bg-background/70 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(215,163,40,0.18),transparent_60%)]" />
      <div className="relative flex flex-col items-center gap-6">
        <BrandLoader label={label} size="lg" />
        <LoaderBar />
      </div>
    </div>,
    document.body
  );
}
