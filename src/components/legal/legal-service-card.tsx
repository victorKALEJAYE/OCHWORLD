import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LegalIcon } from "@/components/legal/legal-icon";
import type { LegalServiceSummary } from "@/lib/legal/queries";
import { cn } from "@/lib/utils";

/** One legal service: icon, title, short description, linking to its own page. */
export function LegalServiceCard({ service, className }: { service: LegalServiceSummary; className?: string }) {
  return (
    <Link
      href={`/legal-services/${service.slug}`}
      className={cn(
        "group flex h-full flex-col rounded-xl border bg-card p-6 shadow-card transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-foreground hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <span className="grid size-12 place-items-center rounded-lg bg-foreground text-primary">
        <LegalIcon name={service.icon} className="size-6" />
      </span>
      <h3 className="mt-5 font-display text-lg font-bold leading-snug">{service.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
        Learn more
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
}
