import { Suspense } from "react";
import { FeaturedProperties, FeaturedPropertiesSkeleton } from "@/components/home/featured-properties";
import { BrowseCategories, HomeHero, ListPropertyCta, PopularDistricts } from "@/components/home/home-sections";
import { SiteHeader } from "@/components/layout/site-header";
import { getDistricts } from "@/lib/properties/queries";
import type { DistrictSummary } from "@/lib/properties/types";

/**
 * Homepage: property discovery first. Black hero with search (dominant colour),
 * then white sections. Visitors never need an account to browse.
 */
export default async function HomePage() {
  // Districts power the search's location list and "Popular areas". If they
  // fail to load, the page still renders and search falls back to "All of Abuja".
  const districts: DistrictSummary[] = await getDistricts().catch((error) => {
    console.error(error);
    return [];
  });

  return (
    <>
      <SiteHeader />
      <main>
        <HomeHero districts={districts} />
        <Suspense fallback={<FeaturedPropertiesSkeleton />}>
          <FeaturedProperties />
        </Suspense>
        <BrowseCategories />
        <PopularDistricts districts={districts} />
        <ListPropertyCta />
      </main>
    </>
  );
}
