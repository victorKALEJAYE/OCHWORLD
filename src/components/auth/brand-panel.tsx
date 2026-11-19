import { DisplayHeading } from "@/components/brand/display-heading";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/config/site";

/**
 * Left-hand panel on large screens. Typographic only: no feature claims here
 * until those features exist.
 */
export function BrandPanel() {
  return (
    <aside className="relative hidden flex-col justify-between border-r p-12 lg:flex xl:p-16">
      <Logo />

      <div className="max-w-xl">
        <DisplayHeading as="h2" lead="Find your place" accent="in Abuja." />
        <p className="mt-8 max-w-sm text-lg text-muted-foreground">
          Homes and commercial spaces for sale and rent across the capital, in one place.
        </p>
      </div>

      <p className="text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name} · Federal Capital Territory, Nigeria
      </p>
    </aside>
  );
}
