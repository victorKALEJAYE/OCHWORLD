import type { Metadata } from "next";
import Link from "next/link";
import { ExploreNav, SourceList } from "@/components/explore/explore-nav";
import { MASTER_PLAN_NOTE, MASTER_PLAN_SECTIONS } from "@/content/explore/master-plan";

export const metadata: Metadata = {
  title: "Abuja Master Plan",
  description:
    "Why Abuja was planned, the structure of the FCT, the city's phases and districts, land use, and how development approvals work.",
};

/** Long-form guide; content lives in src/content/explore/master-plan.ts. */
export default function MasterPlanPage() {
  return (
    <>
      <ExploreNav active="master-plan" />
      <main className="mx-auto grid max-w-content gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-24 space-y-2 text-sm">
            {MASTER_PLAN_SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-muted-foreground hover:text-foreground">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="max-w-3xl">
          <p className="eyebrow">Explore Abuja</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">The Abuja Master Plan</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            How Nigeria planned a new capital from scratch, and what that means when you buy, rent or build.
          </p>

          <div className="mt-10 space-y-12">
            {MASTER_PLAN_SECTIONS.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24 space-y-4">
                <h2 className="text-2xl font-bold">{s.title}</h2>
                {s.paragraphs.map((p) => (
                  <p key={p.slice(0, 40)} className="leading-relaxed">
                    {p}
                  </p>
                ))}
                {s.points && (
                  <ul className="list-disc space-y-2 pl-5 leading-relaxed marker:text-primary">
                    {s.points.map((p) => (
                      <li key={p.slice(0, 40)}>{p}</li>
                    ))}
                  </ul>
                )}
                <SourceList sources={s.sources} />
              </section>
            ))}
          </div>

          <div className="mt-12 rounded-lg border bg-surface p-6">
            <p className="font-semibold">Buying land or a property?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Have a lawyer search the title at AGIS and check the survey before you pay.{" "}
              <Link href="/legal-services" className="link">
                Property legal services
              </Link>
            </p>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">{MASTER_PLAN_NOTE}</p>
        </article>
      </main>
    </>
  );
}
