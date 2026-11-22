import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { LegalHowItWorks } from "@/components/legal/legal-how-it-works";
import { LegalRequestForm } from "@/components/legal/legal-request-form";
import { LegalServiceCard } from "@/components/legal/legal-service-card";
import { Button } from "@/components/ui/button";
import { getViewer } from "@/lib/auth/viewer";
import { LegalIcon } from "@/components/legal/legal-icon";
import { getLegalService, getLegalServices } from "@/lib/legal/queries";
import { getPropertyBySlug } from "@/lib/properties/queries";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ property?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getLegalService(slug).catch(() => null);
  if (!service) return { title: "Legal service not found" };
  return { title: `${service.title} in Abuja`, description: service.summary };
}

/** A single legal service: what it is, what it covers, why you'd need it, and a request form. */
export default async function LegalServicePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { property: propertySlug } = await searchParams;
  const service = await getLegalService(slug);
  if (!service) notFound();

  const [all, property, viewer] = await Promise.all([
    getLegalServices(),
    propertySlug ? getPropertyBySlug(propertySlug).catch(() => null) : null,
    getViewer(),
  ]);
  const others = all.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <>
      <main>
        <section className="border-b bg-surface">
          <div className="mx-auto max-w-content px-4 py-12 sm:px-6 sm:py-16">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
              <Link href="/legal-services" className="hover:text-foreground">
                Legal services
              </Link>
              <ChevronRight className="size-4" aria-hidden="true" />
              <span className="text-foreground">{service.title}</span>
            </nav>
            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
              <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-foreground text-primary">
                <LegalIcon name={service.icon} className="size-8" />
              </span>
              <div>
                <h1 className="font-display text-3xl font-bold sm:text-5xl">{service.title}</h1>
                <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{service.summary}</p>
                <Button asChild className="mt-6">
                  <Link href="#request">Request {service.title.toLowerCase()}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-content gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_minmax(0,460px)]">
          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold">About this service</h2>
              <p className="mt-4 max-w-2xl leading-relaxed">{service.description}</p>
            </section>

            {service.covers.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold">What it covers</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {service.covers.map((c) => (
                    <li key={c} className="flex gap-3 rounded-lg border bg-card p-4 text-sm">
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {service.reasons.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold">Why you might need it</h2>
                <ul className="mt-5 space-y-3">
                  {service.reasons.map((r) => (
                    <li key={r} className="flex gap-3">
                      <HelpCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <LegalHowItWorks />
          </div>

          <div id="request" className="scroll-mt-24 self-start rounded-xl border bg-background p-6 shadow-card sm:p-8 lg:sticky lg:top-24">
            <h2 className="text-xl font-bold">Request {service.title.toLowerCase()}</h2>
            <p className="mb-6 mt-1 text-sm text-muted-foreground">Free to ask. A lawyer quotes before any work starts.</p>
            <LegalRequestForm
              services={all}
              service={{ slug: service.slug, title: service.title }}
              property={property ? { id: property.id, title: property.title, district: property.district } : undefined}
              defaultName={viewer?.name}
              defaultEmail={viewer?.email}
            />
          </div>
        </div>

        {others.length > 0 && (
          <section className="border-t bg-surface">
            <div className="mx-auto max-w-content px-4 py-14 sm:px-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-2xl font-bold">Other legal services</h2>
                <Link href="/legal-services" className="link text-sm">
                  All legal services
                </Link>
              </div>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {others.map((s) => (
                  <li key={s.slug}>
                    <LegalServiceCard service={s} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
