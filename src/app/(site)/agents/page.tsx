import type { Metadata } from "next";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { OrganizationList } from "@/components/directory/organization-list";
import { SiteHeader } from "@/components/layout/site-header";
import { getOrganizations } from "@/lib/properties/queries";
import type { OrganizationSummary } from "@/lib/properties/types";

export const metadata: Metadata = {
  title: "Agents and landlords",
  description: "Estate agencies, developers and landlords listing property on OCHWORLD.",
};

export default async function AgentsPage() {
  let organizations: OrganizationSummary[] | null = null;
  try {
    organizations = await getOrganizations();
  } catch (error) {
    console.error(error);
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-content px-4 py-10 sm:px-6">
        <p className="eyebrow">Agents</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Agents and landlords</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          The agencies, developers and landlords listing property on OCHWORLD.
        </p>
        <div className="mt-10">
          {!organizations ? (
            <ErrorState />
          ) : organizations.length === 0 ? (
            <EmptyState icon={Users} title="No agents yet" description="Agencies appear here once they join." />
          ) : (
            <OrganizationList organizations={organizations} />
          )}
        </div>
      </main>
    </>
  );
}
