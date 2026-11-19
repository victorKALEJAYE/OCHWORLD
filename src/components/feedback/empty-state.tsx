import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** A button or link that helps the user move on (e.g. "Clear filters"). */
  action?: React.ReactNode;
  className?: string;
};

/** Shown when a list or search has nothing to display. Always says what to do next. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center rounded-lg border border-dashed px-6 py-12 text-center", className)}>
      <span className="grid size-12 place-items-center rounded-full bg-muted text-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
