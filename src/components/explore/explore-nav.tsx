import Link from "next/link";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/areas", label: "Overview", key: "overview" },
  { href: "/areas/master-plan", label: "Abuja Master Plan", key: "master-plan" },
  { href: "/areas/attractions", label: "Attractions", key: "attractions" },
  { href: "/areas#districts", label: "Districts", key: "districts" },
] as const;

export type ExploreSection = (typeof ITEMS)[number]["key"];

/** Section tabs shared by every Explore Abuja page. */
export function ExploreNav({ active }: { active: ExploreSection }) {
  return (
    <div className="border-b bg-background">
      <nav aria-label="Explore Abuja" className="mx-auto flex max-w-content gap-6 overflow-x-auto px-4 [scrollbar-width:none] sm:px-6">
        {ITEMS.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-current={item.key === active ? "page" : undefined}
            className={cn(
              "-mb-px shrink-0 border-b-2 border-transparent py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
              "aria-[current=page]:border-primary aria-[current=page]:text-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

/** Small "Sources" list under a section; every fact on these pages links to where it came from. */
export function SourceList({ sources }: { sources: { label: string; url: string }[] }) {
  return (
    <p className="text-xs text-muted-foreground">
      Sources:{" "}
      {sources.map((s, i) => (
        <span key={s.url}>
          {i > 0 && " · "}
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground">
            {s.label}
          </a>
        </span>
      ))}
    </p>
  );
}
