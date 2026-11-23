"use client";

import * as React from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Phones and tablets: price and a "Contact agent" button pinned to the bottom
 * of the screen, so visitors don't have to scroll past the whole listing to
 * reach the form. Hides itself while the form (or the footer) is on screen.
 */
export function MobileContactBar({ price, targetId }: { price: string; targetId: string }) {
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    const targets = [document.getElementById(targetId), document.querySelector("footer")].filter(Boolean) as Element[];
    if (targets.length === 0) return;
    const onScreen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) onScreen.add(e.target);
        else onScreen.delete(e.target);
      }
      setHidden(onScreen.size > 0);
    });
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [targetId]);

  return (
    <div
      aria-hidden={hidden || undefined}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur transition-transform duration-200 lg:hidden",
        hidden && "translate-y-full"
      )}
    >
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <p className="min-w-0 truncate font-display text-lg font-bold">{price}</p>
        <a
          href={`#${targetId}`}
          tabIndex={hidden ? -1 : undefined}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <MessageSquare className="size-4" aria-hidden="true" />
          Contact agent
        </a>
      </div>
    </div>
  );
}
