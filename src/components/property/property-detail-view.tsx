import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { EnquiryForm } from "@/components/property/enquiry-form";
import { OrganizationCard } from "@/components/property/organization-card";
import { PropertyFacts } from "@/components/property/property-facts";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PropertyGrid } from "@/components/property/property-grid";
import { SaveButton } from "@/components/property/save-button";
import { Badge } from "@/components/ui/badge";
import { formatListedDate, formatPrice } from "@/lib/format";
import { propertiesHref } from "@/lib/properties/filters";
import type { PropertyCardData, PropertyDetail } from "@/lib/properties/types";
import type { Viewer } from "@/lib/auth/viewer";

type Props = {
  property: PropertyDetail;
  similar: PropertyCardData[];
  viewer: Viewer | null;
  saved: boolean;
};

/** Property detail page body. Data is loaded by the route and passed in. */
export function PropertyDetailView({ property, similar, viewer, saved }: Props) {
  const location = [property.address, property.district, "Abuja"].filter(Boolean).join(", ");

  return (
    <main className="mx-auto max-w-content px-4 py-8 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
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

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-8">
          <header className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="solid">{property.listingType === "sale" ? "For sale" : "For rent"}</Badge>
              {property.isFeatured && <Badge variant="gold">Featured</Badge>}
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">{property.title}</h1>
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
          <div className="space-y-6 rounded-lg border p-6 shadow-card">
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
          <SaveButton propertyId={property.id} slug={property.slug} saved={saved} />
          {!viewer && (
            <p className="text-center text-xs text-muted-foreground">Sign in to save properties and track enquiries.</p>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16 border-t pt-12">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-bold">More in {property.district}</h2>
            <Link href={propertiesHref({ district: property.districtSlug })} className="link text-sm">
              View all
            </Link>
          </div>
          <PropertyGrid properties={similar} />
        </section>
      )}
    </main>
  );
}
