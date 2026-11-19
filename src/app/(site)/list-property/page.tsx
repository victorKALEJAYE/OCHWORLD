import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "List a property",
  description: "Agents, developers and landlords: list homes and commercial property in Abuja on OCHWORLD.",
};

const steps = [
  { title: "Create your account", text: "Sign up as an agent or landlord. It's free." },
  { title: "Add your listing", text: "Photos, price, district and the details buyers and tenants ask about." },
  { title: "Receive enquiries", text: "People contact you from your listing page by email or phone." },
];

/**
 * Entry point for agents and landlords. Registration happens here because
 * listing requires an account; browsing never does.
 */
export default function ListPropertyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-content px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="eyebrow">For agents and landlords</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">List your property on OCHWORLD</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Reach people looking for homes, offices and land across Abuja.
          </p>
        </div>

        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-lg border p-6">
              <span className="grid size-9 place-items-center rounded-full bg-primary font-display font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h2 className="mt-4 font-display text-lg font-bold">{step.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button asChild size="lg">
            <Link href="/sign-up?type=agent">Create an agent account</Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            Listing tools are being finished. Create your account now to be ready when they open.
          </p>
        </div>
      </main>
    </>
  );
}
