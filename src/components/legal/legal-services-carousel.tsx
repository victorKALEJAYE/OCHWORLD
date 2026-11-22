"use client";

import * as React from "react";
import { LegalServiceCard } from "@/components/legal/legal-service-card";
import type { LegalServiceSummary } from "@/lib/legal/queries";
import { cn } from "@/lib/utils";

/** Time each position stays on screen before sliding to the next. */
const SLIDE_EVERY_MS = 4500;
/** After the visitor swipes or taps a dot, wait this long before sliding again. */
const RESUME_AFTER_MS = 8000;

/**
 * Legal services as an auto-sliding row, like a shopping app's banner slider:
 * one step at a time every few seconds, the next item peeking in at the edge,
 * position dots underneath (the current one stretched into a pill), looping
 * back to the start.
 *
 * - Native horizontal scrolling with snap points, so swiping works on phones.
 * - Pauses while hovered or focused, and for a few seconds after the visitor
 *   swipes or taps a dot, then carries on (no pause/play button).
 * - Never moves for visitors who prefer reduced motion; dots still work.
 */
export function LegalServicesCarousel({ services }: { services: LegalServiceSummary[] }) {
  const trackRef = React.useRef<HTMLUListElement>(null);
  const [active, setActive] = React.useState(0);
  const [positions, setPositions] = React.useState(services.length);
  const [hovered, setHovered] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(true);
  const pausedUntil = React.useRef(0);

  /** Width of one item plus the gap. */
  const step = React.useCallback(() => {
    const el = trackRef.current;
    const item = el?.querySelector("li");
    if (!el || !item) return 1;
    return item.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || "0");
  }, []);

  const measure = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const s = step();
    const last = Math.max(0, Math.round((el.scrollWidth - el.clientWidth) / s));
    setPositions(last + 1);
    setActive(Math.min(last, Math.round(el.scrollLeft / s)));
  }, [step]);

  React.useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = trackRef.current;
    if (!el) return;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      io.disconnect();
    };
  }, [measure]);

  const goTo = React.useCallback(
    (index: number) => {
      trackRef.current?.scrollTo({ left: index * step(), behavior: "smooth" });
    },
    [step]
  );

  // Slide one step every few seconds; after the last position, go back to the first.
  React.useEffect(() => {
    if (reducedMotion || hovered || !visible || positions <= 1) return;
    const id = window.setInterval(() => {
      if (document.hidden || Date.now() < pausedUntil.current) return;
      goTo(active >= positions - 1 ? 0 : active + 1);
    }, SLIDE_EVERY_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, hovered, visible, positions, active, goTo]);

  const holdOff = () => {
    pausedUntil.current = Date.now() + RESUME_AFTER_MS;
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Legal services"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
    >
      <ul
        ref={trackRef}
        onPointerDown={holdOff}
        onWheel={holdOff}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-10 overflow-x-auto scroll-smooth px-4 py-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {services.map((s, i) => (
          <li
            key={s.slug}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${services.length}: ${s.title}`}
            // Phones: one item with the next peeking in. Larger screens: more per view.
            className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/2)] lg:w-[calc((100%-5rem)/3)] xl:w-[calc((100%-7.5rem)/4)]"
          >
            <LegalServiceCard service={s} variant="plain" />
          </li>
        ))}
      </ul>

      {positions > 1 && (
        <div className="mt-4 flex justify-center" role="group" aria-label="Choose slide">
          {Array.from({ length: positions }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                holdOff();
                goTo(i);
              }}
              aria-label={`Go to slide ${i + 1} of ${positions}`}
              aria-current={i === active ? "true" : undefined}
              // Small dot, larger invisible tap area.
              className="group grid h-8 place-items-center px-1"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-300",
                  i === active ? "w-6 bg-foreground" : "w-1.5 bg-foreground/25 group-hover:bg-foreground/50"
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
