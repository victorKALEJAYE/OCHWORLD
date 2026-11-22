"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";
import { LegalServiceCard } from "@/components/legal/legal-service-card";
import type { LegalServiceSummary } from "@/lib/legal/queries";
import { cn } from "@/lib/utils";

/** Seconds per card for one full loop: slow enough to read, steady enough to feel alive. */
const SECONDS_PER_CARD = 7;

/**
 * Legal services as a continuous, endlessly looping row (a "marquee").
 *
 * - Pure CSS animation: the list is rendered twice side by side and the track
 *   slides left by exactly one copy, so the loop is seamless.
 * - Pauses while hovered or while a card has keyboard focus, and with the
 *   visible Pause button (WCAG 2.2.2: moving content can be stopped).
 * - For visitors who prefer reduced motion it doesn't move at all: the second
 *   copy is hidden and the row becomes a normal swipeable list.
 * - The duplicate copy is hidden from screen readers and keyboard focus.
 */
export function LegalServicesCarousel({ services }: { services: LegalServiceSummary[] }) {
  const [paused, setPaused] = React.useState(false);
  const duration = `${services.length * SECONDS_PER_CARD}s`;

  return (
    <div role="region" aria-label="Legal services" className="group/marquee">
      <div className="mb-4 flex justify-end motion-reduce:hidden">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border bg-background px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          {paused ? <Play className="size-3.5" aria-hidden="true" /> : <Pause className="size-3.5" aria-hidden="true" />}
          {paused ? "Play" : "Pause"}
          <span className="sr-only"> moving legal services</span>
        </button>
      </div>

      <div className="-mx-4 overflow-hidden sm:-mx-6 motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none]">
        <div
          style={{ "--marquee-duration": duration, ...(paused ? { animationPlayState: "paused" } : {}) } as React.CSSProperties}
          className="flex w-max animate-marquee py-2 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none"
        >
          <CardRow services={services} />
          <CardRow services={services} duplicate />
        </div>
      </div>
    </div>
  );
}

function CardRow({ services, duplicate = false }: { services: LegalServiceSummary[]; duplicate?: boolean }) {
  return (
    <ul
      aria-hidden={duplicate || undefined}
      // `inert` keeps the copy's links out of keyboard focus.
      {...(duplicate ? { inert: true } : {})}
      className={cn("flex shrink-0 gap-4 pl-4 sm:pl-6", duplicate && "motion-reduce:hidden")}
    >
      {services.map((s) => (
        <li key={s.slug} className="w-[280px] shrink-0 sm:w-[300px]">
          <LegalServiceCard service={s} />
        </li>
      ))}
    </ul>
  );
}
