import type { Enums } from "@/lib/supabase/database.types";

/**
 * The services themselves live in the legal_services table (managed by the
 * OCHWORLD team). These labels only cover requests made before that table
 * existed, which used a fixed list.
 */
export const LEGACY_SERVICE_LABELS: Record<Enums<"legal_service">, string> = {
  title_verification: "Title verification",
  survey_verification: "Survey verification",
  agreement_review: "Agreements",
  transfer_consent: "Transfer and Governor's consent",
  due_diligence: "Full due diligence",
};

export const LEGAL_STATUS_LABELS: Record<Enums<"legal_request_status">, string> = {
  new: "Received",
  in_progress: "In progress",
  completed: "Completed",
  closed: "Closed",
};

/** Which service a listing page suggests: buyers check the land and title, renters the tenancy. */
export const SUGGESTED_SERVICE = { sale: "land-and-title-matters", rent: "tenancy-matters" } as const;
