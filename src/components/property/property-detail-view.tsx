import Link from "next/link";
import { SUGGESTED_SERVICE } from "@/lib/legal/constants";
import { ChevronRight, MapPin, ShieldCheck } from "lucide-react";
import { EnquiryForm } from "@/components/property/enquiry-form";
import { OrganizationCard } from "@/components/property/organization-card";
import { PropertyFacts } from "@/components/property/property-facts";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PropertyGrid } from "@/components/property/property-grid";
import { FavouriteButton } from "@/components/property/favourite-button";
import { MobileContactBar } from "@/components/property/mobile-contact-bar";
import { Badge } from "@/components/ui/badge";
import { formatListedDate, formatPrice } from "@/lib/format";
import { propertiesHref } from "@/lib/properties/filters";
import type { PropertyCardData, PropertyDetail } from "@/lib/properties/types";
import type { Viewer } from "@/lib/auth/viewer";

type Props = {
  property: PropertyDetail;
  similar: PropertyCardData[];
  viewer: Viewer | null;
  /** Whether the viewer has this property in favourites. */
  saved: boolean;
  /** Which similar listings the viewer has favourited. */
  similarFavouriteIds?: ReadonlySet<string>;
};

/** Property detail page body. Data is loaded by the route and passed in. */
export function PropertyDetailView({ property, similar, viewer, saved, similarFavouriteIds }: Props) {
  const location = [property.address, property.district, "Abuja"].filter(Boolean).join(", ");

  return (
    <main className="mx-auto max-w-content px-4 pb-24 pt-4 sm:px-6 sm:pt-8 lg:pb-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground sm:mb-6">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/properties" className="hover:text-foreground">
              Properties
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li>
            <Link href={propertiesHref({ district: property.districtSlug })} className="hover:text-foreground">
              {property.district}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5" />
          </li>
          <li aria-current="page" className="truncate text-foreground">
            {property.title}
          </li>
        </ol>
      </nav>

      <PropertyGallery images={property.images} title={property.title} />

      <div className="mt-6 grid gap-10 sm:mt-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-8">
          <header className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="solid">{property.listingType === "sale" ? "For sale" : "For rent"}</Badge>
              {property.isFeatured && <Badge variant="brand">Featured</Badge>}
            </div>
            <h1 className="text-2xl font-bold sm:text-4xl">{property.title}</h1>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="size-4 shrink-0" aria-hidden="true" />
              {location}
            </p>
            <p className="font-display text-3xl font-bold">{formatPrice(property.price, property.rentPeriod)}</p>
            {property.publishedAt && (
              <p className="text-sm text-muted-foreground">{formatListedDate(property.publishedAt)}</p>
            )}
          </header>

          <PropertyFacts property={property} />

          {property.description && (
            <section>
              <h2 className="text-xl font-bold">About this property</h2>
              <div className="mt-3 space-y-3 leading-relaxed">
                {property.description.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          )}

          {property.features.length > 0 && (
            <section>
              <h2 className="text-xl font-bold">Features</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {property.features.map((f) => (
                  <li key={f}>
                    <Badge variant="outline" className="px-3 py-1 text-sm font-medium">
                      {f}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div id="contact" className="scroll-mt-20 space-y-6 rounded-lg border p-5 shadow-card sm:p-6">
            <OrganizationCard organization={property.organization} />
            <div className="border-t pt-6">
              <h2 className="mb-4 text-lg font-bold">Contact the agent</h2>
              <EnquiryForm
                propertyId={property.id}
                propertyTitle={property.title}
                defaultName={viewer?.name}
                defaultEmail={viewer?.email}
              />
            </div>
          </div>
          <FavouriteButton propertyId={property.id} initialFavourite={saved} variant="full" />
          <LegalCheckCallout slug={property.slug} listingType={property.listingType} />
          {!viewer && (
            <p className="text-center text-xs text-muted-foreground">Sign in to keep favourites and track your enquiries.</p>
          )}
        </aside>
      </div>

      <MobileContactBar price={formatPrice(property.price, property.rentPeriod)} targetId="contact" />

      {similar.length > 0 && (
        <section className="mt-16 border-t pt-12">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-bold">More in {property.district}</h2>
            <Link href={propertiesHref({ district: property.districtSlug })} className="link text-sm">
              View all
            </Link>
          </div>
          <PropertyGrid properties={similar} favouriteIds={similarFavouriteIds} layout="row" />
        </section>
      )}
    </main>
  );
}

/** Points buyers and renters to the relevant legal service before they pay anything. */
function LegalCheckCallout({ slug, listingType }: { slug: string; listingType: "sale" | "rent" }) {
  const isSale = listingType === "sale";
  return (
    <div className="flex gap-3 rounded-lg border bg-surface p-5">
      <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="space-y-1.5">
        <p className="font-semibold">{isSale ? "Verify the title before you pay" : "Check the agreement before you sign"}</p>
        <p className="text-sm text-muted-foreground">
          {isSale
            ? "A property lawyer can search AGIS and check the C of O and survey for this property."
            : "A property lawyer can review the tenancy agreement and the landlord's right to let."}
        </p>
        <Link href={`/legal-services/${SUGGESTED_SERVICE[listingType]}?property=${slug}#request`} className="link inline-block text-sm">
          {isSale ? "Request a title check" : "Request a tenancy review"}
        </Link>
      </div>
    </div>
  );
}
