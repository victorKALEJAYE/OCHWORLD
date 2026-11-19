import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertState = { type: "error" | "success"; message: string } | null;

export function FormAlert({ state }: { state: AlertState }) {
  if (!state) return null;
  const isError = state.type === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-md border px-4 py-3 text-sm",
        isError
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-success/40 bg-success/10 text-success"
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <p>{state.message}</p>
    </div>
  );
}
