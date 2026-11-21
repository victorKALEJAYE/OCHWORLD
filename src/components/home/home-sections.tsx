import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building, Home, KeyRound, LandPlot, MapPin } from "lucide-react";
import { HeroSearch } from "@/components/search/hero-search";
import { Button } from "@/components/ui/button";
import { districtPhoto, heroPhoto, heroVideo } from "@/config/photos";
import { pluralize } from "@/lib/format";
import { propertiesHref } from "@/lib/properties/filters";
import type { DistrictSummary } from "@/lib/properties/types";

/**
 * Presentational homepage sections. Data is fetched by the page and passed in,
 * which keeps these components simple to test and preview.
 */

export function HomeHero({ districts }: { districts: DistrictSummary[] }) {
  return (
    <section className="relative isolate flex min-h-[520px] items-center overflow-hidden bg-black text-white sm:min-h-[600px]">
      {heroPhoto && <Image src={heroPhoto} alt="" fill priority sizes="100vw" className="-z-20 object-cover" />}
      {heroVideo && (
        // Muted, looping background video; the photo underneath shows while it loads,
        // and instead of it for people who prefer reduced motion.
        <video
          className="absolute inset-0 -z-20 size-full object-cover motion-reduce:hidden"
          src={heroVideo}
          poster={heroPhoto ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      )}
      {/* Light, even tint (no gradient) so the photo stays visible and white text stays readable. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/45" />

      <div className="mx-auto w-full max-w-content px-4 py-16 sm:px-6">
        <h1 className="max-w-3xl font-display text-[2.75rem] font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
          Buy. Rent. Invest.
          <br />
          In Abuja<span className="text-primary">.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-white/85">
          Homes, apartments, offices and land across the Federal Capital Territory.
        </p>
        <HeroSearch districts={districts} className="mt-8" />
      </div>
    </section>
  );
}

export function SectionHeader({
  title,
  description,
  href,
  linkLabel,
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
        {description && <p className="mt-1 text-muted-foreground">{description}</p>}
      </div>
      {href && linkLabel && (
        <Link href={href} className="link inline-flex items-center gap-1 text-sm">
          {linkLabel} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

const categories = [
  { icon: Home, title: "Homes to buy", text: "Duplexes, terraces and apartments", href: propertiesHref({ listing: "sale", category: "residential" }) },
  { icon: KeyRound, title: "Homes to rent", text: "Yearly rentals across the city", href: propertiesHref({ listing: "rent", category: "residential" }) },
  { icon: Building, title: "Commercial", text: "Offices, shops and warehouses", href: propertiesHref({ category: "commercial" }) },
  { icon: LandPlot, title: "Land", text: "Residential and commercial plots", href: propertiesHref({ category: "land" }) },
];

export function BrowseCategories() {
  return (
    <section className="mx-auto max-w-content px-4 py-16 sm:px-6">
      <SectionHeader title="Browse by category" />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map(({ icon: Icon, title, text, href }) => (
          <li key={title}>
            <Link
              href={href}
              className="group flex h-full flex-col rounded-lg border bg-card p-5 shadow-card transition-colors hover:border-foreground"
            >
              <Icon className="size-6 text-primary" aria-hidden="true" />
              <span className="mt-6 font-display text-lg font-bold">{title}</span>
              <span className="mt-1 text-sm text-muted-foreground">{text}</span>
              <ArrowRight
                className="mt-4 size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PopularDistricts({ districts }: { districts: DistrictSummary[] }) {
  const popular = [...districts]
    .filter((d) => d.listingCount > 0)
    .sort((a, b) => b.listingCount - a.listingCount)
    .slice(0, 8);
  if (popular.length === 0) return null;

  return (
    <section className="border-y bg-surface">
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
        <SectionHeader title="Popular areas" href="/areas" linkLabel="Explore all of Abuja" />
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {popular.map((d) => {
            const photo = districtPhoto(d.slug);
            return (
              <li key={d.slug}>
                <Link
                  href={propertiesHref({ district: d.slug })}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-lg border bg-muted shadow-card"
                >
                  {photo ? (
                    <Image
                      src={photo}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <MapPin className="absolute left-1/2 top-[38%] size-6 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2.5 text-white">
                    <span className="block font-semibold leading-tight">{d.name}</span>
                    <span className="block text-xs text-white/80">{pluralize(d.listingCount, "listing")}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function ListPropertyCta() {
  return (
    <section className="mx-auto max-w-content px-4 py-16 sm:px-6">
      <div className="flex flex-col items-start justify-between gap-6 rounded-lg border p-8 sm:flex-row sm:items-center sm:p-10">
        <div>
          <h2 className="text-2xl font-bold">Are you an agent or landlord?</h2>
          <p className="mt-1 max-w-lg text-muted-foreground">
            Put your properties in front of people searching in Abuja every day.
          </p>
        </div>
        <Button asChild variant="secondary" size="lg">
          <Link href="/list-property">List a property</Link>
        </Button>
      </div>
    </section>
  );
}
