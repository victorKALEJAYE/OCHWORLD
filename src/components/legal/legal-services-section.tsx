import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LegalServicesCarousel } from "@/components/legal/legal-services-carousel";
import { getLegalServices } from "@/lib/legal/queries";

/**
 * Homepage section after the featured listings: the legal services slider on
 * its own (no visible heading, by request; screen readers still get a name).
 * Hidden if the catalogue is empty or can't load.
 */
export async function LegalServicesSection() {
  const services = await getLegalServices();
  if (services.length === 0) return null;

  return (
    <section aria-label="Legal services" className="border-y bg-surface">
      <div className="mx-auto max-w-content px-4 py-10 sm:px-6 sm:py-12">
        <LegalServicesCarousel services={services} />
        <div className="mt-2 flex justify-center">
          <Link href="/legal-services" className="link inline-flex items-center gap-1 text-sm">
            All legal services <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
