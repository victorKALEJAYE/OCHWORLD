import type { Enums } from "@/lib/supabase/database.types";

export type LegalService = Enums<"legal_service">;

/**
 * The property legal services OCHWORLD helps arrange. Descriptions say what
 * the check covers, never promise an outcome or price (those come from the
 * lawyer's quote).
 */
export const LEGAL_SERVICES: {
  value: LegalService;
  title: string;
  summary: string;
  covers: string[];
}[] = [
  {
    value: "title_verification",
    title: "Title verification",
    summary: "Confirm the seller really owns the land and the title is genuine before you pay.",
    covers: [
      "Search of the title at AGIS (Abuja Geographic Information Systems)",
      "Check of the C of O or R of O and its history",
      "Encumbrances, revocations and disputes on record",
    ],
  },
  {
    value: "survey_verification",
    title: "Survey verification",
    summary: "Make sure the plot on the ground matches the plot on the papers.",
    covers: [
      "Survey plan check against official records",
      "Beacon and boundary confirmation",
      "Land use and setback checks",
    ],
  },
  {
    value: "agreement_review",
    title: "Agreements",
    summary: "Have a lawyer draft or review the documents before you sign.",
    covers: [
      "Contract of sale or offer letter",
      "Tenancy agreement and its renewal terms",
      "Developer and off-plan agreements",
    ],
  },
  {
    value: "transfer_consent",
    title: "Transfer and Governor's consent",
    summary: "Put the property in your name properly after you buy.",
    covers: [
      "Deed of assignment",
      "Application for the Minister's / Governor's consent",
      "Registration of the transfer",
    ],
  },
  {
    value: "due_diligence",
    title: "Full due diligence",
    summary: "A complete check of the property, the seller and the agent or developer.",
    covers: [
      "Everything in title and survey verification",
      "Checks on the seller, agent or developer",
      "A written report with the risks in plain English",
    ],
  },
];

export const LEGAL_SERVICE_LABELS = Object.fromEntries(LEGAL_SERVICES.map((s) => [s.value, s.title])) as Record<
  LegalService,
  string
>;

export const LEGAL_STATUS_LABELS: Record<Enums<"legal_request_status">, string> = {
  new: "Received",
  in_progress: "In progress",
  completed: "Completed",
  closed: "Closed",
};
