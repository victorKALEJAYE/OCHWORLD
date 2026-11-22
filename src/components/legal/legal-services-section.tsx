import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LegalServicesCarousel } from "@/components/legal/legal-services-carousel";
import { getLegalServices } from "@/lib/legal/queries";

/**
 * Homepage section after the featured listings: supports property discovery
 * rather than competing with it (lighter surface, smaller heading). Hidden if
 * the catalogue is empty or can't load.
 */
export async function LegalServicesSection() {
  const services = await getLegalServices();
  if (services.length === 0) return null;

  return (
    <section aria-labelledby="legal-services-heading" className="border-y bg-surface">
      <div className="mx-auto max-w-content px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow">Legal services</p>
            <h2 id="legal-services-heading" className="mt-2 text-2xl font-bold sm:text-3xl">
              Legal support for every property decision
            </h2>
            <p className="mt-2 text-muted-foreground">
              Independent property lawyers can check titles, prepare your documents and resolve disputes, so you buy and
              rent in Abuja with confidence.
            </p>
          </div>
          <Link href="/legal-services" className="link inline-flex items-center gap-1 text-sm">
            All legal services <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-6">
          <LegalServicesCarousel services={services} />
        </div>
      </div>
    </section>
  );
}
