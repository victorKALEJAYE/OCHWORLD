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
 * The brand lock-up: teal mark + teal wordmark.
 */
export function Logo({ href = "/", className, markOnly = false }: LogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)} aria-label={`${siteConfig.name} home`}>
      <Image src="/ochworld-mark.png" alt="" width={36} height={28} priority className="h-7 w-auto" />
      {!markOnly && (
        <span className="font-display text-lg font-bold tracking-[0.08em] text-brand-teal">{siteConfig.name}</span>
      )}
    </Link>
  );
}
