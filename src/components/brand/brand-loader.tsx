import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { box: "size-10", ring: "border-2", logo: "w-5" },
  md: { box: "size-16", ring: "border-2", logo: "w-8" },
  lg: { box: "size-20", ring: "border-[3px]", logo: "w-10" },
} as const;

type BrandLoaderProps = {
  size?: keyof typeof sizes;
  /** Read by screen readers only. */
  label?: string;
  /** Show the OCHWORLD wordmark under the logo (full-page loaders). */
  withName?: boolean;
  className?: string;
};

const nameSizes = { sm: "text-sm", md: "text-base", lg: "text-lg" } as const;

/**
 * The only loading animation in the product: the logo with a thin teal arc
 * turning around it, optionally with the wordmark underneath. Used for the
 * first visit and page navigation. Data inside a page uses skeletons instead
 * (see components/ui/skeleton).
 */
export function BrandLoader({ size = "md", label = "Loading", withName = false, className }: BrandLoaderProps) {
  const s = sizes[size];
  return (
    <div role="status" className={cn("flex flex-col items-center gap-4", className)}>
      <div className={cn("relative grid place-items-center", s.box)}>
        <span aria-hidden="true" className={cn("absolute inset-0 rounded-full border-primary/15", s.ring)} />
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 animate-spin rounded-full border-transparent border-t-primary [animation-duration:1.1s]",
            s.ring
          )}
        />
        <Image src="/ochworld-mark.png" alt="" width={80} height={62} priority className={cn("h-auto", s.logo)} />
      </div>
      {withName && (
        <span
          aria-hidden="true"
          className={cn("font-display font-bold tracking-[0.2em] text-brand-teal", nameSizes[size])}
        >
          {siteConfig.name}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** Centres the loader in the available page area. */
export function PageLoader({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn("grid min-h-[60dvh] place-items-center", className)}>
      <BrandLoader size="lg" label={label} withName />
    </div>
  );
}
