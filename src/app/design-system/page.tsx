import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, Heart, Search, SearchX } from "lucide-react";

import { BrandLoader } from "@/components/brand/brand-loader";
import { DisplayHeading } from "@/components/brand/display-heading";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { DistrictRatings } from "@/components/explore/district-ratings";
import { LegalServiceCard } from "@/components/legal/legal-service-card";
import { AccountMenuContent } from "@/components/layout/account-menu";
import { SiteHeaderView } from "@/components/layout/site-header";
import { FavouriteButton } from "@/components/property/favourite-button";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyCardSkeleton } from "@/components/property/property-card-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { designReviewAccount, designReviewLegalServices, designReviewProperties, designReviewRatings } from "./fixtures";

export const metadata: Metadata = { title: "Design system", robots: { index: false, follow: false } };

/**
 * Living reference of the OCHWORLD design system, for design review and for
 * developers. Hidden in production unless NEXT_PUBLIC_SHOW_DESIGN_SYSTEM=true.
 */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SHOW_DESIGN_SYSTEM !== "true") notFound();

  return (
    <main className="bg-background pb-24">
      <div className="dark border-b bg-background text-foreground">
        <div className="mx-auto max-w-content px-4 py-16 sm:px-6">
          <p className="eyebrow">OCHWORLD</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Design system</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Two brand colours taken from the logo, pure-grey neutrals, flat surfaces. Each page has one dominant
            colour; gold is the accent.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-content space-y-20 px-4 pt-16 sm:px-6">
        <Section title="Brand colours" note="Measured from the original logo. No other golds: tints use opacity.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Swatch className="bg-brand-gold text-black" name="Gold" hex="#C38C25" usage="Logo, primary button, accents, active states" />
            <Swatch className="bg-brand-black text-white" name="Black" hex="#000000" usage="Dark pages, hero, text on gold" />
          </div>
          <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
            <Contrast pair="Gold on black" ratio="7.1 : 1" ok text="Gold text and links allowed" />
            <Contrast pair="Black on gold" ratio="7.1 : 1" ok text="Primary button label" />
            <Contrast pair="Gold on white" ratio="3.0 : 1" text="Fills and icons only, never body text" />
          </div>
        </Section>

        <Section title="Neutrals" note="Semantic tokens. Same names in both themes; `.dark` swaps the values.">
          <div className="grid gap-6 lg:grid-cols-2">
            <NeutralRow />
            <div className="dark rounded-lg">
              <NeutralRow />
            </div>
          </div>
        </Section>

        <Section title="Page colour plan" note="One dominant colour per page.">
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Page</th>
                  <th className="px-4 py-3 font-semibold">Dominant</th>
                  <th className="px-4 py-3 font-semibold">Gold used for</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pagePlan.map(([page, dominant, accent]) => (
                  <tr key={page}>
                    <td className="px-4 py-3 font-medium">{page}</td>
                    <td className="px-4 py-3">{dominant}</td>
                    <td className="px-4 py-3 text-muted-foreground">{accent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Typography" note="Montserrat for headings (closest to the logo lettering), Inter for text.">
          <div className="space-y-5">
            <TypeRow label="Display · Montserrat ExtraBold · heroes and page intros, once per page">
              <DisplayHeading as="h2" lead="Buy. Rent. Invest." accent="In Abuja." />
            </TypeRow>
            <TypeRow label="H1 · 36px">
              <p className="font-display text-4xl font-bold tracking-tight">Homes for sale in Maitama</p>
            </TypeRow>
            <TypeRow label="H2 · 24px">
              <p className="font-display text-2xl font-bold tracking-tight">Featured properties</p>
            </TypeRow>
            <TypeRow label="H3 · 18px">
              <p className="font-display text-lg font-bold">Neighbourhood</p>
            </TypeRow>
            <TypeRow label="Body · Inter 16px">
              <p className="max-w-2xl">
                A bright family home on a quiet close, five minutes from Aso Drive, with a fitted kitchen and staff
                quarters.
              </p>
            </TypeRow>
            <TypeRow label="Small · 14px muted">
              <p className="text-sm text-muted-foreground">Listed 3 days ago · Updated today</p>
            </TypeRow>
            <TypeRow label="Eyebrow">
              <p className="eyebrow">New this week</p>
            </TypeRow>
          </div>
        </Section>

        <Section title="Buttons" note="One gold button per view, for the main action.">
          <ThemePair>
            <div className="flex flex-wrap items-center gap-3">
              <Button>
                Search properties <ArrowRight />
              </Button>
              <Button variant="secondary">Contact agent</Button>
              <Button variant="outline">Save search</Button>
              <Button variant="ghost">Cancel</Button>
              <Button variant="link">View all</Button>
              <Button variant="outline" size="icon" aria-label="Save property">
                <Heart />
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </ThemePair>
        </Section>

        <Section title="Form elements">
          <ThemePair>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ds-location">Location</Label>
                <Input id="ds-location" placeholder="District, street or estate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ds-type">Property type</Label>
                <Select id="ds-type" defaultValue="">
                  <option value="">Any type</option>
                  <option>Apartment</option>
                  <option>Duplex</option>
                  <option>Commercial</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ds-email">Email</Label>
                <Input id="ds-email" aria-invalid defaultValue="adaeze@" />
                <p className="text-xs font-medium text-destructive">Enter a valid email address</p>
              </div>
              <label className="flex items-center gap-3 self-end pb-3 text-sm">
                <Checkbox defaultChecked /> Furnished only
              </label>
            </div>
          </ThemePair>
        </Section>

        <Section title="Search bar" note="The homepage hero pattern: black dominant, one gold action.">
          <div className="dark rounded-lg border bg-background p-6 text-foreground sm:p-8">
            <div className="mb-5 inline-flex rounded-md border p-1" role="group" aria-label="Listing type">
              <Button size="sm" className="h-8">
                Buy
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-muted-foreground">
                Rent
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto] md:items-end">
              <div className="space-y-2">
                <Label htmlFor="ds-q" className="eyebrow">Location</Label>
                <Input id="ds-q" placeholder="Maitama, Wuse II, Gwarinpa…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ds-t" className="eyebrow">Type</Label>
                <Select id="ds-t">
                  <option>Any type</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ds-p" className="eyebrow">Price</Label>
                <Select id="ds-p">
                  <option>Any price</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ds-b" className="eyebrow">Bedrooms</Label>
                <Select id="ds-b">
                  <option>Any</option>
                </Select>
              </div>
              <Button className="md:w-auto">
                <Search /> Search
              </Button>
            </div>
          </div>
        </Section>

        <Section title="Badges">
          <div className="flex flex-wrap gap-2">
            <Badge variant="solid">For sale</Badge>
            <Badge variant="solid">For rent</Badge>
            <Badge variant="gold">Featured</Badge>
            <Badge variant="neutral">Apartment</Badge>
            <Badge variant="outline">Furnished</Badge>
            <Badge variant="success">Available</Badge>
          </div>
        </Section>

        <Section title="Navigation" note="One white header everywhere. Signed in: initials avatar opens the account menu.">
          <div className="space-y-4 overflow-hidden rounded-lg border">
            <SiteHeaderView className="static" account={null} />
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border">
            <SiteHeaderView className="static" account={designReviewAccount} />
          </div>
          <div className="mt-4 w-72 overflow-hidden rounded-lg border shadow-elevated">
            <AccountMenuContent account={designReviewAccount} />
          </div>
        </Section>

        <Section title="Legal service cards" note="Black icon tile with gold icon. Homepage carousel and legal pages.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {designReviewLegalServices.map((s) => (
              <LegalServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </Section>

        <Section title="Location rating" note="Scored 1-5 by the OCHWORLD team. Unscored categories say so.">
          <div className="max-w-2xl">
            <DistrictRatings ratings={designReviewRatings} />
          </div>
        </Section>

        <Section title="Property cards" note="Images come from Supabase Storage; the grey block is the no-photo state.">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {designReviewProperties.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                saveAction={<FavouriteButton propertyId={p.id} initialFavourite={p.id === "example-2"} />}
              />
            ))}
          </div>
        </Section>

        <Section title="Loading" note="Logo loader for app start and page changes. Skeletons for data inside a page.">
          <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
            <div className="grid grid-cols-2 gap-4 self-start">
              <div className="grid place-items-center rounded-lg border py-10">
                <BrandLoader />
              </div>
              <div className="dark grid place-items-center rounded-lg border bg-background py-10">
                <BrandLoader />
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <PropertyCardSkeleton />
              <PropertyCardSkeleton className="hidden sm:flex" />
            </div>
          </div>
        </Section>

        <Section title="Empty and error states">
          <div className="grid gap-6 md:grid-cols-2">
            <EmptyState
              icon={SearchX}
              title="No homes match your search"
              description="Try a wider price range or another district."
              action={<Button variant="outline">Clear filters</Button>}
            />
            <ErrorState action={<Button variant="secondary">Try again</Button>} />
          </div>
        </Section>
      </div>
    </main>
  );
}

const pagePlan: [string, string, string][] = [
  ["Homepage", "Photo hero (tinted), white sections below", "Search button, gold full stop, “Featured” badges"],
  ["Search & listings", "White", "Active filters, primary action"],
  ["Property detail", "White", "Enquire button"],
  ["Explore Abuja", "White; photo hero on district pages", "Rating bars, active tab"],
  ["Legal services", "White, light-grey sections", "Icon tiles, primary action"],
  ["Sign in & sign up", "White; photo panel on large screens", "Main button, links"],
  ["Dashboards", "White on light-grey canvas", "Primary actions, active tab"],
];

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
      </div>
      {children}
    </section>
  );
}

/** Renders the same content on a light and a dark surface. */
function ThemePair({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-lg border bg-background p-6 text-foreground">{children}</div>
      <div className="dark rounded-lg border bg-background p-6 text-foreground">{children}</div>
    </div>
  );
}

function Swatch({ className, name, hex, usage }: { className: string; name: string; hex: string; usage: string }) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <div className={cn("flex h-32 items-end p-4", className)}>
        <span className="font-display text-xl font-bold">{name}</span>
      </div>
      <div className="flex items-center justify-between gap-4 p-4 text-sm">
        <code className="font-semibold">{hex}</code>
        <span className="text-right text-muted-foreground">{usage}</span>
      </div>
    </div>
  );
}

function Contrast({ pair, ratio, text, ok = false }: { pair: string; ratio: string; text: string; ok?: boolean }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <span className="font-medium">{pair}</span>
        <Badge variant={ok ? "success" : "outline"}>{ratio}</Badge>
      </div>
      <p className="mt-1 text-muted-foreground">{text}</p>
    </div>
  );
}

const neutralTokens = ["background", "surface", "muted", "border", "muted-foreground", "foreground"] as const;
const neutralClass: Record<(typeof neutralTokens)[number], string> = {
  background: "bg-background",
  surface: "bg-surface",
  muted: "bg-muted",
  border: "bg-border",
  "muted-foreground": "bg-muted-foreground",
  foreground: "bg-foreground",
};

function NeutralRow() {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-lg border bg-background p-4 text-foreground sm:grid-cols-6">
      {neutralTokens.map((t) => (
        <div key={t}>
          <div className={cn("h-14 rounded-md border", neutralClass[t])} />
          <p className="mt-2 truncate text-xs text-muted-foreground">{t}</p>
        </div>
      ))}
    </div>
  );
}

function TypeRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b pb-5 md:grid-cols-[220px_1fr] md:items-baseline">
      <p className="text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
