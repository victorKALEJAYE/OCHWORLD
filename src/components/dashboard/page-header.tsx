import Link from "next/link";
import type { Membership } from "@/lib/auth/account";
import { cn } from "@/lib/utils";

/** Title row for dashboard pages, with an organization switcher for people in several. */
export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  action,
  memberships,
  activeId,
  basePath,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  memberships?: Membership[];
  activeId?: string;
  basePath?: string;
}) {
  return (
    <div className="space-y-4">
      {memberships && memberships.length > 1 && basePath && (
        <nav aria-label="Organization" className="flex flex-wrap gap-2">
          {memberships.map((m) => (
            <Link
              key={m.id}
              href={`${basePath}?org=${m.id}`}
              aria-current={m.id === activeId ? "true" : undefined}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors hover:border-foreground",
                m.id === activeId && "border-foreground bg-foreground text-background"
              )}
            >
              {m.name}
            </Link>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="mt-2 text-3xl font-bold">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
