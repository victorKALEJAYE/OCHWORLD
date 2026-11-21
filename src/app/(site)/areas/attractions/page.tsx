import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { ExploreNav, SourceList } from "@/components/explore/explore-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { ATTRACTIONS } from "@/content/explore/attractions";

export const metadata: Metadata = {
  title: "Attractions in Abuja",
  description: "Landmarks, parks, markets and arts across Abuja and the Federal Capital Territory.",
};

const KINDS = ["Landmark", "Park and nature", "Market", "Arts and culture"] as const;

export default function AttractionsPage() {
  return (
    <>
      <SiteHeader />
      <ExploreNav active="attractions" />
      <main className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <p className="eyebrow">Explore Abuja</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Attractions</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
          What to see and do around the city, and which district each place is in.
        </p>

        <div className="mt-10 space-y-12">
          {KINDS.map((kind) => {
            const items = ATTRACTIONS.filter((a) => a.kind === kind);
            if (!items.length) return null;
            return (
              <section key={kind}>
                <h2 className="text-2xl font-bold">{kind === "Landmark" ? "Landmarks" : kind === "Market" ? "Markets" : kind}</h2>
                <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((a) => (
                    <li key={a.name} className="flex flex-col gap-3 rounded-lg border bg-card p-5 shadow-card">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold">{a.name}</h3>
                        <Badge variant="outline" className="shrink-0">
                          {a.kind}
                        </Badge>
                      </div>
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="size-4 shrink-0" aria-hidden="true" />
                        {a.districtSlug ? (
                          <Link href={`/areas/${a.districtSlug}`} className="link">
                            {a.area}
                          </Link>
                        ) : (
                          a.area
                        )}
                      </p>
                      <p className="flex-1 text-sm">{a.description}</p>
                      <SourceList sources={a.sources} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </main>
    </>
  );
}
