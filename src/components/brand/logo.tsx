import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)} aria-label="OCHWORLD home">
      <Image src="/ochworld-mark.png" alt="" width={36} height={36} priority className="size-9 object-contain" />
      <span className="font-display text-lg font-extrabold tracking-[0.18em] text-gold-gradient">OCHWORLD</span>
    </Link>
  );
}
