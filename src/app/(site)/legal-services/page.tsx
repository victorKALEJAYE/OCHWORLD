import type { Metadata } from "next";
import { DisplayHeading } from "@/components/brand/display-heading";
import { LegalHowItWorks } from "@/components/legal/legal-how-it-works";
import { LegalRequestForm } from "@/components/legal/legal-request-form";
import { LegalServiceCard } from "@/components/legal/legal-service-card";
import { getViewer } from "@/lib/auth/viewer";
import { getLegalServices } from "@/lib/legal/queries";
import { getPropertyBySlug } from "@/lib/properties/queries";

export const metadata: Metadata = {
  title: "Property legal services",
  description:
    "Due diligence, documentation, litigation, tenancy and land title services for property in Abuja, from independent property lawyers.",
};

type Props = { searchParams: Promise<{ property?: string; service?: string }> };

/** All legal services, each linking to its own page, plus a general request form. */
export default async function LegalServicesPage({ searchParams }: Props) {
  const { property: slug, service } = await searchParams;
  const [services, property, viewer] = await Promise.all([
    getLegalServices(),
    slug ? getPropertyBySlug(slug).catch(() => null) : null,
    getViewer(),
  ]);

  return (
    <>
      <main>
        <section className="border-b bg-surface">
          <div className="mx-auto max-w-content px-4 py-14 sm:px-6 sm:py-20">
            <p className="eyebrow">Property legal services</p>
            <DisplayHeading lead="Check it" accent="before you pay." className="mt-5" />
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Fake titles, double sales and unclear agreements cost buyers in Abuja every year. Independent property lawyers
              can check the papers, write the agreements and stand by you if things go wrong.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-content px-4 py-14 sm:px-6" aria-labelledby="services-heading">
          <h2 id="services-heading" className="text-2xl font-bold sm:text-3xl">
            Our legal services
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.slug}>
                <LegalServiceCard service={s} />
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y bg-surface">
          <div className="mx-auto grid max-w-content gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_minmax(0,460px)]">
            <LegalHowItWorks />
            <div id="request" className="scroll-mt-24 rounded-xl border bg-background p-6 shadow-card sm:p-8">
              <h2 className="mb-6 text-xl font-bold">Not sure which? Tell us what you need</h2>
              <LegalRequestForm
                services={services}
                defaultService={services.find((s) => s.slug === service)?.slug}
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
