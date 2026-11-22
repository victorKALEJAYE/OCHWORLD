import { Scale } from "lucide-react";
import { LEGAL_ICONS } from "@/lib/legal/icons";
import type { LegalServiceIcon } from "@/lib/supabase/database.types";

/** Draws a legal service's icon from its stored name. */
export function LegalIcon({ name, className }: { name: LegalServiceIcon; className?: string }) {
  const Icon = LEGAL_ICONS[name] ?? Scale;
  return <Icon className={className} aria-hidden="true" />;
}
