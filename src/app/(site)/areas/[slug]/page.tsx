import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, MapPin } from "lucide-react";
import { DistrictMap } from "@/components/explore/district-map";
import { DistrictRatings } from "@/components/explore/district-ratings";
import { ExploreNav } from "@/components/explore/explore-nav";
import { RatingsEditor } from "@/components/explore/ratings-editor";
import { EmptyState } from "@/components/feedback/empty-state";
import { PropertyGrid } from "@/components/property/property-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { districtPhoto } from "@/config/photos";
import { ATTRACTIONS } from "@/content/explore/attractions";
import { DISTRICT_PROFILES } from "@/content/explore/districts";
import { getAccount } from "@/lib/auth/account";
import { getDistrict, getDistrictRatings } from "@/lib/explore/queries";
import { pluralize } from "@/lib/format";
import { parsePropertyFilters, propertiesHref } from "@/lib/properties/filters";
import { getFavouriteIds, searchProperties } from "@/lib/properties/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const district = await getDistrict(slug).catch(() => null);
  if (!district) return { title: "District not found" };
  return {
    title: `${district.name}, Abuja: area guide and properties`,
    description: DISTRICT_PROFILES[slug]?.summary ?? `Homes and commercial property in ${district.name}, Abuja.`,
  };
}

/** One district: profile, map, team rating, nearby attractions and listings. */
export default async function DistrictPage({ params }: Props) {
  const { slug } = await params;
  const district = await getDistrict(slug);
  if (!district) notFound();

  const profile = DISTRICT_PROFILES[slug];
  const photo = districtPhoto(slug);
  const nearby = ATTRACTIONS.filter((a) => a.districtSlug === slug);
  const [ratings, listings, account] = await Promise.all([
    getDistrictRatings(district.id),
    searchProperties(parsePropertyFilters({ district: slug })).catch((error) => {
      console.error(error);
      return null;
    }),
    getAccount().catch(() => null),
  ]);
  const shown = listings?.items.slice(0, 6) ?? [];
  const favouriteIds = await getFavouriteIds(shown.map((p) => p.id));
  const allHref = propertiesHref({ district: slug });

  return (
    <>
      <ExploreNav active="districts" />
      <main>
        <section className="dark relative overflow-hidden bg-background text-foreground">
          {photo && (
            <>
              <Image src={photo} alt="" fill priority sizes="100vw" className="object-cover" />
              <div aria-hidden="true" className="absolute inset-0 bg-black/70" />
            </>
          )}
          <div className="relative mx-auto max-w-content px-4 pb-12 pt-8 sm:px-6 sm:pb-16">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-white/75">
              <Link href="/areas" className="hover:text-white">
                Explore Abuja
              </Link>
              <ChevronRight className="size-4" aria-hidden="true" />
              <Link href="/areas#districts" className="hover:text-white">
                Districts
              </Link>
            </nav>
            <h1 className="mt-8 font-display text-4xl font-bold sm:text-5xl">{district.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {profile && <Badge variant="gold">{profile.phase}</Badge>}
              <Badge variant="outline" className="border-white/40 text-white">
                {district.listingCount > 0 ? pluralize(district.listingCount, "property", "properties") + " available" : "No listings yet"}
              </Badge>
            </div>
            {profile && <p className="mt-6 max-w-2xl text-lg text-white/85">{profile.summary}</p>}
          </div>
        </section>

        <div className="mx-auto grid max-w-content gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <DistrictRatings ratings={ratings} />
            {account?.isPlatformAdmin && <RatingsEditor districtId={district.id} slug={slug} ratings={ratings} />}
          </div>
          <div className="space-y-6">
            {profile && <DistrictMap name={district.name} centre={profile.centre} />}
            <section aria-labelledby="nearby-heading" className="rounded-lg border bg-card p-6 shadow-card">
              <h2 id="nearby-heading" className="text-lg font-bold">
                Facilities and places nearby
              </h2>
              {nearby.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {nearby.map((a) => (
                    <li key={a.name} className="flex gap-3">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span>
                        <span className="block text-sm font-semibold">{a.name}</span>
                        <span className="text-sm text-muted-foreground">{a.description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Our guide to schools, hospitals, markets and other amenities here is coming soon. Meanwhile, use the map to
                  look around.
                </p>
              )}
              <Link href="/areas/attractions" className="link mt-4 inline-block text-sm">
                All attractions in Abuja
              </Link>
            </section>
          </div>
        </div>

        <section className="border-t bg-surface">
          <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-2xl font-bold sm:text-3xl">Properties in {district.name}</h2>
              {listings && listings.total > shown.length && (
                <Link href={allHref} className="link inline-flex items-center gap-1 text-sm">
                  See all {listings.total} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              )}
            </div>
            {shown.length > 0 ? (
              <PropertyGrid properties={shown} favouriteIds={favouriteIds} />
            ) : (
              <EmptyState
                icon={MapPin}
                className="bg-background"
                title={`No properties listed in ${district.name} yet`}
                description="Check back soon, or browse nearby districts."
                action={
                  <Button asChild variant="outline">
                    <Link href="/properties">Browse all properties</Link>
                  </Button>
                }
              />
            )}
          </div>
        </section>
      </main>
    </>
  );
}
