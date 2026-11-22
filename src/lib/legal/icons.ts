import {
  Building2,
  FileSearch,
  FileText,
  Gavel,
  Handshake,
  KeyRound,
  LandPlot,
  MessagesSquare,
  Scale,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { LegalServiceIcon } from "@/lib/supabase/database.types";

/** Icon names stored in legal_services.icon → the icons drawn on cards and pages. */
export const LEGAL_ICONS: Record<LegalServiceIcon, LucideIcon> = {
  "file-search": FileSearch,
  "file-text": FileText,
  gavel: Gavel,
  messages: MessagesSquare,
  key: KeyRound,
  land: LandPlot,
  scale: Scale,
  shield: ShieldCheck,
  building: Building2,
  handshake: Handshake,
};
