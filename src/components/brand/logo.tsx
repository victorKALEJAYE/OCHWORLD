import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  className?: string;
  /** Hide the wordmark and show only the mark (e.g. on narrow headers). */
  markOnly?: boolean;
};

/**
 * The brand lock-up: gold mark + gold wordmark, as in the original artwork.
 * The logo is the one place gold is used as text on light backgrounds; logos are
 * exempt from text-contrast rules, but keep it at 18px or larger there.
 */
export function Logo({ href = "/", className, markOnly = false }: LogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)} aria-label={`${siteConfig.name} home`}>
      <Image src="/ochworld-mark.png" alt="" width={36} height={28} priority className="h-7 w-auto" />
      {!markOnly && (
        <span className="font-display text-lg font-bold tracking-[0.08em] text-brand-gold">{siteConfig.name}</span>
      )}
    </Link>
  );
}
