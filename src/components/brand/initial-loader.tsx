"use client";

import { useEffect, useState } from "react";
import { BrandLoader } from "@/components/brand/brand-loader";
import { INITIAL_LOADER_SEEN_KEY } from "@/lib/initial-loader";

/** Keeps the loader up long enough to read as intentional rather than a flicker. */
const MIN_VISIBLE_MS = 700;
const FADE_MS = 400;

/**
 * Loader shown when the site first opens in a browser session: black screen,
 * logo with the turning gold ring, nothing else. It fades out as soon as the
 * page has loaded (never later), so it doesn't slow anyone down.
 *
 * - Later page changes in the same session use app/loading.tsx instead.
 * - Returning in the same session: an inline script in <head> marks the page
 *   before first paint so the overlay is never drawn (no flash).
 * - If JavaScript fails, a CSS fail-safe in globals.css hides it after 6s.
 */
export function InitialLoader() {
  const [state, setState] = useState<"loading" | "done" | "removed">("loading");

  useEffect(() => {
    try {
      sessionStorage.setItem(INITIAL_LOADER_SEEN_KEY, "1");
    } catch {
      /* storage blocked: the loader simply shows again next time */
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const finish = () => {
      // performance.now() counts from the start of navigation.
      const wait = Math.max(0, MIN_VISIBLE_MS - performance.now());
      timers.push(
        setTimeout(() => {
          setState("done");
          timers.push(setTimeout(() => setState("removed"), FADE_MS));
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

  if (state === "removed") return null;

  return (
    <div className="initial-loader dark" data-state={state} aria-hidden={state === "done"}>
      <BrandLoader size="lg" label="Loading OCHWORLD" />
    </div>
  );
}
