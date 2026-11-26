import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LegalIcon } from "@/components/legal/legal-icon";
import type { LegalServiceSummary } from "@/lib/legal/queries";
import { cn } from "@/lib/utils";

type Variant = "card" | "plain" | "photo";

/**
 * One legal service linking to its own page.
 * - `card` (default): bordered card for grids.
 * - `photo`: card with the service's picture on top (homepage slider).
 * - `plain`: no box at all.
 */
export function LegalServiceCard({
  service,
  variant = "card",
  className,
}: {
  service: LegalServiceSummary;
  variant?: Variant;
  className?: string;
}) {
  if (variant === "photo") return <PhotoCard service={service} className={className} />;
  const plain = variant === "plain";
  return (
    <Link
      href={`/legal-services/${service.slug}`}
      className={cn(
        "group flex h-full flex-col rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-surface",
        !plain &&
          "border bg-card p-6 shadow-card transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-foreground hover:shadow-elevated",
        className
      )}
    >
      <span className="grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground">
        <LegalIcon name={service.icon} className="size-6" />
      </span>
      <Title>{service.title}</Title>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
      <LearnMore />
    </Link>
  );
}

function PhotoCard({ service, className }: { service: LegalServiceSummary; className?: string }) {
  return (
    <Link
      href={`/legal-services/${service.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-card transition-[border-color,box-shadow] duration-200 hover:border-foreground hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {service.imageUrl ? (
          <Image
            src={service.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 80vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <LegalIcon name={service.icon} className="absolute inset-0 m-auto size-10 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5">
        {/* Icon tile overlaps the photo's bottom edge. */}
        <span className="relative -mt-6 grid size-12 place-items-center rounded-lg bg-primary text-primary-foreground ring-4 ring-card">
          <LegalIcon name={service.icon} className="size-6" />
        </span>
        <Title className="mt-4">{service.title}</Title>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
        <LearnMore />
      </div>
    </Link>
  );
}

function Title({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3
      className={cn(
        "mt-5 font-display text-lg font-bold leading-snug decoration-primary decoration-2 underline-offset-4 group-hover:underline",
        className
      )}
    >
      {children}
    </h3>
  );
}

function LearnMore() {
  return (
    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold">
      Learn more
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </span>
  );
}
