import Link from "next/link";
import { ArrowRight, Building, Home, KeyRound, LandPlot } from "lucide-react";
import { DisplayHeading } from "@/components/brand/display-heading";
import { HeroSearch } from "@/components/search/hero-search";
import { Button } from "@/components/ui/button";
import { pluralize } from "@/lib/format";
import { propertiesHref } from "@/lib/properties/filters";
import type { DistrictSummary } from "@/lib/properties/types";

/**
 * Presentational homepage sections. Data is fetched by the page and passed in,
 * which keeps these components simple to test and preview.
 */

export function HomeHero({ districts }: { districts: DistrictSummary[] }) {
  return (
    <section className="dark bg-background text-foreground">
      <div className="mx-auto max-w-content px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
        <p className="eyebrow">Abuja property marketplace</p>
        <DisplayHeading lead="Find your place" accent="in Abuja." size="xl" className="mt-6" />
        <p className="mt-8 max-w-xl text-lg text-muted-foreground">
          Homes, apartments, offices and land for sale and rent across the Federal Capital Territory.
        </p>
        <div className="mt-10">
          <HeroSearch districts={districts} />
        </div>
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
        <ul className="flex flex-wrap gap-3">
          {popular.map((d) => (
            <li key={d.slug}>
              <Link
                href={propertiesHref({ district: d.slug })}
                className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium transition-colors hover:border-foreground"
              >
                {d.name}
                <span className="text-muted-foreground">{pluralize(d.listingCount, "listing")}</span>
              </Link>
            </li>
          ))}
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
