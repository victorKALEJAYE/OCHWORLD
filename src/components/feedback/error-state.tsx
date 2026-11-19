import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  description?: string;
  /** Usually a "Try again" button wired to a retry or Next.js `reset()`. */
  action?: React.ReactNode;
  className?: string;
};

/** Shown when loading fails. Plain language, no error codes, always a way to retry. */
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this right now. Check your connection and try again.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div role="alert" className={cn("flex flex-col items-center rounded-lg border px-6 py-12 text-center", className)}>
      <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
