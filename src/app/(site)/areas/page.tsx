import type { Metadata } from "next";
import { ErrorState } from "@/components/feedback/error-state";
import { DistrictGrid } from "@/components/directory/district-grid";
import { SiteHeader } from "@/components/layout/site-header";
import { getDistricts } from "@/lib/properties/queries";
import type { DistrictSummary } from "@/lib/properties/types";

export const metadata: Metadata = {
  title: "Explore Abuja",
  description: "Browse homes and commercial property by district across Abuja.",
};

/** District directory. Area ratings (security, power, water) come in a later phase once there is real data. */
export default async function AreasPage() {
  let districts: DistrictSummary[] | null = null;
  try {
    districts = await getDistricts();
  } catch (error) {
    console.error(error);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-content px-4 py-10 sm:px-6">
        <p className="eyebrow">Explore Abuja</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Find property by district</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          From Maitama and Asokoro to Gwarinpa and Lugbe, see what&apos;s available in each part of the city.
        </p>

        <div className="mt-10">
          {districts ? <DistrictGrid districts={districts} /> : <ErrorState />}
        </div>
      </main>
    </>
  );
}
