import Image from "next/image";
import { DisplayHeading } from "@/components/brand/display-heading";
import { heroPhoto } from "@/config/photos";
import { siteConfig } from "@/config/site";

/**
 * Left-hand panel on large screens: the homepage hero in miniature (same photo,
 * same black tint, same headline), so signing in feels like the same site.
 * Typographic only: no feature claims until those features exist.
 */
export function BrandPanel() {
  return (
    <aside className="dark relative hidden min-h-[560px] flex-col justify-end overflow-hidden rounded-lg bg-background p-10 text-foreground lg:flex xl:p-12">
      {heroPhoto && (
        <>
          <Image src={heroPhoto} alt="" fill sizes="50vw" className="object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-black/70" />
        </>
      )}
      <div className="relative max-w-xl">
        <p className="eyebrow">{siteConfig.name}</p>
        <DisplayHeading as="h2" lead="Find your place" accent="in Abuja." className="mt-4" />
        <p className="mt-6 max-w-sm text-lg text-white/85">
          Homes and commercial spaces for sale and rent across the capital, in one place.
        </p>
      </div>
    </aside>
  );
}
