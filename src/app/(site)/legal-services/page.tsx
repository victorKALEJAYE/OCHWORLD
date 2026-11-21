import type { Metadata } from "next";
import { Check, FileSearch, Handshake, Scale } from "lucide-react";
import { DisplayHeading } from "@/components/brand/display-heading";
import { LegalRequestForm } from "@/components/legal/legal-request-form";
import { SiteHeader } from "@/components/layout/site-header";
import { getViewer } from "@/lib/auth/viewer";
import { LEGAL_SERVICES, type LegalService } from "@/lib/legal/constants";
import { getPropertyBySlug } from "@/lib/properties/queries";

export const metadata: Metadata = {
  title: "Property legal services",
  description:
    "Verify titles at AGIS, check survey plans, review agreements and process Governor's consent before you buy or rent in Abuja.",
};

type Props = { searchParams: Promise<{ property?: string; service?: string }> };

const STEPS = [
  { icon: FileSearch, title: "Tell us what you need", text: "Choose a service and the property. It's free to ask." },
  { icon: Scale, title: "Get a quote", text: "We call you to confirm the details, then a lawyer quotes before any work starts." },
  { icon: Handshake, title: "Buy with confidence", text: "You get the findings and documents, in plain English, before you pay the seller." },
];

/**
 * Property legal services: the checks that protect buyers and renters from
 * fake titles and bad agreements, a common risk in Abuja land deals.
 * `?property=<slug>&service=<service>` comes from the "Verify this property"
 * box on listing pages and pre-fills the form.
 */
export default async function LegalServicesPage({ searchParams }: Props) {
  const { property: slug, service } = await searchParams;
  const [property, viewer] = await Promise.all([
    slug ? getPropertyBySlug(slug).catch(() => null) : null,
    getViewer(),
  ]);
  const defaultService = LEGAL_SERVICES.find((s) => s.value === service)?.value as LegalService | undefined;

  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b bg-surface">
          <div className="mx-auto max-w-content px-4 py-14 sm:px-6 sm:py-20">
            <p className="eyebrow">Property legal services</p>
            <DisplayHeading lead="Check it" accent="before you pay." className="mt-5" />
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Fake titles, double sales and unclear agreements cost buyers in Abuja every year. Have a property lawyer
              verify the documents first.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-content px-4 py-14 sm:px-6">
          <h2 className="text-2xl font-bold sm:text-3xl">What we can help with</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LEGAL_SERVICES.map((s) => (
              <li key={s.value} className="flex flex-col rounded-lg border bg-card p-6 shadow-card">
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.summary}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {s.covers.map((c) => (
                    <li key={c} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y bg-surface">
          <div className="mx-auto grid max-w-content gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_minmax(0,460px)]">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">How it works</h2>
              <ol className="mt-8 space-y-6">
                {STEPS.map(({ icon: Icon, title, text }, i) => (
                  <li key={title} className="flex gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-foreground text-background">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-semibold">
                        {i + 1}. {title}
                      </p>
                      <p className="text-sm text-muted-foreground">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-10 max-w-md text-xs text-muted-foreground">
                OCHWORLD connects you with independent property lawyers; it does not give legal advice itself. A
                verification reports what official records show at the time of the search.
              </p>
            </div>

            <div id="request" className="scroll-mt-24 rounded-lg border bg-background p-6 shadow-card sm:p-8">
              <h2 className="mb-6 text-xl font-bold">Request legal help</h2>
              <LegalRequestForm
                defaultService={defaultService ?? (property ? "title_verification" : undefined)}
                property={property ? { id: property.id, title: property.title, district: property.district } : undefined}
                defaultName={viewer?.name}
                defaultEmail={viewer?.email}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
