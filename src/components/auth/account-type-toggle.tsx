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
              "flex items-center gap-3 rounded-xl border p-3 text-left backdrop-blur-md transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40",
              active
                ? "border-gold-500/60 bg-gold-500/10 shadow-[0_0_0_1px_rgba(215,163,40,0.25)]"
                : "border-white/10 bg-white/[0.03] hover:border-white/20"
            )}
          >
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-lg",
                active ? "bg-gold-500 text-ink" : "bg-white/5 text-muted-foreground"
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
