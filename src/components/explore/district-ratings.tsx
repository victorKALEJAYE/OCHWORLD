import { Star } from "lucide-react";
import { RATING_CATEGORIES, overallScore } from "@/lib/explore/constants";
import type { DistrictRatings as Ratings } from "@/lib/explore/queries";
import { cn } from "@/lib/utils";

const updated = new Intl.DateTimeFormat("en-NG", { month: "long", year: "numeric" });

/** The OCHWORLD team's scores for a district, with an overall location rating. */
export function DistrictRatings({ ratings }: { ratings: Ratings }) {
  const overall = overallScore(Object.fromEntries(Object.entries(ratings).map(([k, v]) => [k, v?.score])));
  const dates = Object.values(ratings).map((r) => r!.updatedAt).sort();
  const latest = dates.at(-1);

  return (
    <section aria-labelledby="ratings-heading" className="rounded-lg border bg-card p-6 shadow-card">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-5">
        <div>
          <h2 id="ratings-heading" className="text-xl font-bold">
            Location rating
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Scored 1 to 5 by the OCHWORLD team{latest ? `, last updated ${updated.format(new Date(latest))}` : ""}.
          </p>
        </div>
        <p className="flex items-baseline gap-1">
          {overall === null ? (
            <span className="text-sm font-semibold text-muted-foreground">Not yet rated</span>
          ) : (
            <>
              <span className="font-display text-4xl font-bold">{overall.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">/ 5</span>
            </>
          )}
        </p>
      </div>

      <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {RATING_CATEGORIES.map(({ value, label, help }) => {
          const r = ratings[value];
          return (
            <div key={value}>
              <dt className="flex items-center justify-between gap-2 text-sm font-semibold">
                {label}
                <span className="font-normal text-muted-foreground">{r ? `${r.score}/5` : "Not yet rated"}</span>
              </dt>
              <dd className="mt-2 space-y-1.5">
                <span className="flex gap-1" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={cn("h-1.5 flex-1 rounded-full", r && n <= r.score ? "bg-primary" : "bg-muted")} />
                  ))}
                </span>
                <span className="block text-xs text-muted-foreground">{r?.note ?? help}</span>
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Star className="size-3.5" aria-hidden="true" /> Ratings are the team&apos;s judgement from visits and local knowledge, not
        official statistics. Conditions vary street by street; visit before you commit.
      </p>
    </section>
  );
}
