import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { propertiesHref, type PropertyFilters } from "@/lib/properties/filters";
import { cn } from "@/lib/utils";

/** Page numbers to show: first, last, and a window around the current page. */
function pageWindow(page: number, pageCount: number): (number | "…")[] {
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? (["…", p] as const) : [p]));
}

export function Pagination({ filters, pageCount }: { filters: PropertyFilters; pageCount: number }) {
  if (pageCount <= 1) return null;
  const { page } = filters;
  const href = (p: number) => propertiesHref({ ...filters, page: p });

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <PageLink href={href(page - 1)} disabled={page <= 1} label="Previous page">
        <ChevronLeft className="size-4" />
      </PageLink>
      {pageWindow(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <PageLink key={p} href={href(p)} current={p === page} label={`Page ${p}`}>
            {p}
          </PageLink>
        )
      )}
      <PageLink href={href(page + 1)} disabled={page >= pageCount} label="Next page">
        <ChevronRight className="size-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  current,
  disabled,
  label,
  children,
}: {
  href: string;
  current?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const base = "grid size-10 place-items-center rounded-md text-sm font-semibold";
  if (disabled) {
    return (
      <span aria-hidden="true" className={cn(base, "text-muted-foreground/50")}>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className={cn(base, current ? "bg-foreground text-background" : "hover:bg-muted")}
    >
      {children}
    </Link>
  );
}
