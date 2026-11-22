import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Landmark, Map as MapIcon, MapPinned } from "lucide-react";
import { DisplayHeading } from "@/components/brand/display-heading";
import { MediaBackground } from "@/components/brand/media-background";
import { DistrictGrid } from "@/components/directory/district-grid";
import { ExploreNav } from "@/components/explore/explore-nav";
import { ErrorState } from "@/components/feedback/error-state";
import { explorePhoto, exploreVideo } from "@/config/photos";
import { getDistricts } from "@/lib/properties/queries";
import type { DistrictSummary } from "@/lib/properties/types";

export const metadata: Metadata = {
  title: "Explore Abuja",
  description: "How Abuja is planned, what to see, and what each district is like, with properties available in each.",
};

const GUIDES = [
  {
    href: "/areas/master-plan",
    icon: MapIcon,
    title: "Abuja Master Plan",
    text: "Why Abuja was built, how the city is laid out in phases and districts, land use, and how approvals work.",
  },
  {
    href: "/areas/attractions",
    icon: Landmark,
    title: "Attractions",
    text: "Landmarks, parks, markets and culture across the city and the wider territory.",
  },
  {
    href: "#districts",
    icon: MapPinned,
    title: "Districts",
    text: "Each district on a map, rated by our team for security, roads, power, flooding and more.",
  },
];

/** Explore Abuja hub: the three guides and every district. */
export default async function AreasPage() {
  let districts: DistrictSummary[] | null = null;
  try {
    districts = await getDistricts();
  } catch (error) {
    console.error(error);
  }

  return (
    <>
      <ExploreNav active="overview" />
      <main>
        <section className="dark relative isolate flex min-h-[420px] items-center overflow-hidden bg-black text-white sm:min-h-[520px]">
          <MediaBackground photo={explorePhoto} video={exploreVideo} tint="bg-black/55" priority />
          <div className="mx-auto w-full max-w-content px-4 py-16 sm:px-6">
            <p className="eyebrow">Explore Abuja</p>
            <DisplayHeading lead="Know the city" accent="before you move." size="xl" className="mt-5 max-w-3xl" />
            <p className="mt-6 max-w-2xl text-lg text-white/85">
              Abuja is one of the few capitals in the world planned from scratch. Understanding the plan and the districts
              helps you choose where to buy or rent.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-content px-4 py-14 sm:px-6">
          <ul className="grid gap-4 md:grid-cols-3">
            {GUIDES.map(({ href, icon: Icon, title, text }) => (
              <li key={href}>
                <Link href={href} className="group flex h-full flex-col rounded-lg border bg-card p-6 shadow-card transition-colors hover:border-foreground">
                  <Icon className="size-6" aria-hidden="true" />
                  <h2 className="mt-4 text-lg font-bold">{title}</h2>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                    Open <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section id="districts" className="scroll-mt-24 border-t bg-surface">
          <div className="mx-auto max-w-content px-4 py-14 sm:px-6">
            <h2 className="text-2xl font-bold sm:text-3xl">Explore districts</h2>
            <p className="mt-1 max-w-2xl text-muted-foreground">
              Pick a district for its profile, map, location rating and the properties available there.
            </p>
            <div className="mt-8">{districts ? <DistrictGrid districts={districts} /> : <ErrorState />}</div>
          </div>
        </section>
      </main>
    </>
  );
}
