import { Search } from "lucide-react";
import type { DistrictSummary } from "@/lib/properties/types";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "", label: "All" },
  { value: "sale", label: "Buy" },
  { value: "rent", label: "Rent" },
];

/**
 * Homepage search, Zillow-style: one big box. A plain GET form to
 * /properties?q=…&listing=…, so it works without JavaScript and the URL can be
 * shared. Typing a district name suggests it (native <datalist>); any other
 * text searches listing titles and addresses.
 */
export function HeroSearch({ districts, className }: { districts: DistrictSummary[]; className?: string }) {
  return (
    <form action="/properties" method="get" role="search" aria-label="Search properties" className={cn("w-full max-w-2xl", className)}>
      <fieldset className="mb-3 inline-flex rounded-full bg-white/15 p-1 backdrop-blur-sm">
        <legend className="sr-only">Buy or rent</legend>
        {TABS.map((t) => (
          <label
            key={t.label}
            className="cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold text-white transition-colors has-[:checked]:bg-white has-[:checked]:text-black has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary"
          >
            <input type="radio" name="listing" value={t.value} defaultChecked={t.value === ""} className="sr-only" />
            {t.label}
          </label>
        ))}
      </fieldset>

      <div className="flex h-16 items-center rounded-lg bg-white pl-5 pr-2 text-black shadow-elevated focus-within:ring-2 focus-within:ring-primary">
        <label htmlFor="hero-q" className="sr-only">
          District, estate or street
        </label>
        <input
          id="hero-q"
          name="q"
          list="hero-districts"
          autoComplete="off"
          placeholder="Enter a district, estate or street"
          className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-500 sm:text-lg"
        />
        <datalist id="hero-districts">
          {districts.map((d) => (
            <option key={d.slug} value={d.name} />
          ))}
        </datalist>
        <button
          type="submit"
          aria-label="Search"
          className="grid size-12 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Search className="size-5" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
