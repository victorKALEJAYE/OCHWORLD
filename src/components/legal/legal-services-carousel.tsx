"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { LegalServiceCard } from "@/components/legal/legal-service-card";
import type { LegalServiceSummary } from "@/lib/legal/queries";
import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 6000;

/**
 * Horizontally scrolling legal service cards.
 *
 * - Native scrolling with snap points: swipe on phones, trackpad/shift-wheel on desktop.
 * - Arrow buttons (desktop) move one card at a time and disable at the ends.
 * - Gentle auto-advance: one card every 6 s, only while the carousel is on
 *   screen. It pauses on hover/focus, stops for good the moment the visitor
 *   touches, scrolls or uses the arrows, never runs for people who prefer
 *   reduced motion, and has a visible pause button (WCAG 2.2.2).
 */
export function LegalServicesCarousel({ services }: { services: LegalServiceSummary[] }) {
  const trackRef = React.useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const userTookOver = React.useRef(false);

  // Start auto-advance only for visitors who haven't asked for less motion.
  React.useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(true);
  }, []);

  const updateEnds = React.useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }, []);

  React.useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateEnds();
    el.addEventListener("scroll", updateEnds, { passive: true });
    window.addEventListener("resize", updateEnds);
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => {
      el.removeEventListener("scroll", updateEnds);
      window.removeEventListener("resize", updateEnds);
      io.disconnect();
    };
  }, [updateEnds]);

  /** Width of one card plus the gap, i.e. one "step". */
  const step = () => {
    const el = trackRef.current;
    const card = el?.querySelector("li");
    if (!el || !card) return 0;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0");
    return card.getBoundingClientRect().width + gap;
  };

  const scrollByCards = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * step(), behavior: "smooth" });
  };

  const takeOver = () => {
    userTookOver.current = true;
    setPlaying(false);
  };

  React.useEffect(() => {
    if (!playing || hovered || !visible || userTookOver.current) return;
    const id = window.setInterval(() => {
      const el = trackRef.current;
      if (!el || document.hidden) return;
      const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      el.scrollTo({ left: end ? 0 : el.scrollLeft + step(), behavior: "smooth" });
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [playing, hovered, visible]);

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
      <div className="mb-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => (playing ? takeOver() : ((userTookOver.current = false), setPlaying(true)))}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border bg-background px-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
          aria-label={playing ? "Pause automatic scrolling" : "Play automatic scrolling"}
        >
          {playing ? <Pause className="size-3.5" aria-hidden="true" /> : <Play className="size-3.5" aria-hidden="true" />}
          {playing ? "Pause" : "Play"}
        </button>
        <ArrowButton direction={-1} disabled={atStart} onClick={() => (takeOver(), scrollByCards(-1))} />
        <ArrowButton direction={1} disabled={atEnd} onClick={() => (takeOver(), scrollByCards(1))} />
      </div>

      <ul
        ref={trackRef}
        onPointerDown={takeOver}
        onWheel={(e) => Math.abs(e.deltaX) > Math.abs(e.deltaY) && takeOver()}
        onKeyDown={(e) => (e.key === "ArrowLeft" || e.key === "ArrowRight") && takeOver()}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-4 sm:scroll-px-6 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {services.map((s, i) => (
          <li
            key={s.slug}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${services.length}: ${s.title}`}
            className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-3rem)/4)]"
          >
            <LegalServiceCard service={s} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArrowButton({ direction, disabled, onClick }: { direction: 1 | -1; disabled: boolean; onClick: () => void }) {
  const Icon = direction === 1 ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 1 ? "Next services" : "Previous services"}
      className={cn(
        "hidden size-10 place-items-center rounded-full border bg-background transition-colors hover:border-foreground md:grid",
        "disabled:cursor-default disabled:opacity-40 disabled:hover:border-border"
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
    </button>
  );
}
