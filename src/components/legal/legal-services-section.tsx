import { LegalServicesCarousel } from "@/components/legal/legal-services-carousel";
import { getLegalServices } from "@/lib/legal/queries";

/**
 * Homepage section after the featured listings: the legal services slider on
 * its own, with no heading or links around it (by request; screen readers
 * still get a name). Each card opens its service page.
 * Hidden if the catalogue is empty or can't load.
 */
export async function LegalServicesSection() {
  const services = await getLegalServices();
  if (services.length === 0) return null;

  return (
    <section aria-label="Legal services" className="border-y bg-surface">
      <div className="mx-auto max-w-content px-4 py-10 sm:px-6 sm:py-12">
        <LegalServicesCarousel services={services} />
      </div>
    </section>
  );
}
