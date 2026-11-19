"use client";

import { Briefcase, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SignUpValues } from "@/lib/validations/auth";

type AccountType = SignUpValues["accountType"];

const options: { value: AccountType; label: string; text: string; Icon: typeof Home }[] = [
  { value: "seeker", label: "Home seeker", text: "Buy or rent", Icon: Home },
  { value: "agent", label: "Agent / Landlord", text: "List property", Icon: Briefcase },
];

export function AccountTypeToggle({ value, onChange }: { value: AccountType; onChange: (v: AccountType) => void }) {
  return (
    <div role="radiogroup" aria-label="Account type" className="grid grid-cols-2 gap-3">
      {options.map(({ value: v, label, text, Icon }) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v)}
            className={cn(
              "flex items-center gap-3 rounded-md border p-3 text-left transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "border-primary bg-primary/10"
                : "border-input hover:bg-muted"
            )}
          >
            <span
              className={cn(
                "hidden size-9 shrink-0 place-items-center rounded-sm sm:grid",
                active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{label}</span>
              <span className="block text-xs text-muted-foreground">{text}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
