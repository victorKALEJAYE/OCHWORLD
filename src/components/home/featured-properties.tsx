import Link from "next/link";
import { Building2 } from "lucide-react";
import { SectionHeader } from "@/components/home/home-sections";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PropertyGrid } from "@/components/property/property-grid";
import { PropertyGridSkeleton } from "@/components/property/property-card-skeleton";
import { Button } from "@/components/ui/button";
import { getFeaturedProperties } from "@/lib/properties/queries";
import type { PropertyCardData } from "@/lib/properties/types";

/** Loads featured listings. Rendered inside <Suspense> so the hero shows immediately. */
export async function FeaturedProperties() {
  let properties: PropertyCardData[];
  try {
    properties = await getFeaturedProperties(6);
  } catch (error) {
    console.error(error);
    return (
      <FeaturedShell>
        <ErrorState
          description="We couldn't load listings right now. Please refresh the page in a moment."
          action={
            <Button asChild variant="secondary">
              <Link href="/">Try again</Link>
            </Button>
          }
        />
      </FeaturedShell>
    );
  }
  return <FeaturedPropertiesView properties={properties} />;
}

export function FeaturedPropertiesView({ properties }: { properties: PropertyCardData[] }) {
  return (
    <FeaturedShell>
      {properties.length > 0 ? (
        <PropertyGrid properties={properties} />
      ) : (
        <EmptyState
          icon={Building2}
          title="No listings yet"
          description="New homes and spaces appear here as soon as agents publish them."
          action={
            <Button asChild variant="outline">
              <Link href="/list-property">List a property</Link>
            </Button>
          }
        />
      )}
    </FeaturedShell>
  );
}

export function FeaturedPropertiesSkeleton() {
  return (
    <FeaturedShell>
      <PropertyGridSkeleton count={3} />
    </FeaturedShell>
  );
}

function FeaturedShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-content px-4 pt-16 sm:px-6">
      <SectionHeader
        title="Featured properties"
        description="Hand-picked listings across Abuja"
        href="/properties"
        linkLabel="View all properties"
      />
      {children}
    </section>
  );
}
