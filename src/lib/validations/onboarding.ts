import { z } from "zod";

export const ONBOARDING_ACCOUNT_TYPES = ["seeker", "agency", "landlord", "developer"] as const;
export type OnboardingAccountType = (typeof ONBOARDING_ACCOUNT_TYPES)[number];

const phone = z
  .string()
  .trim()
  .max(20)
  .optional()
  .refine((v) => !v || /^(\+?234|0)[789][01]\d{8}$/.test(v.replace(/\s/g, "")), {
    message: "Enter a valid Nigerian phone number",
  });

/**
 * Mirrors the checks in the `complete_onboarding` database function, which
 * validates again: this schema is for friendly messages, not security.
 */
export const onboardingSchema = z.discriminatedUnion("accountType", [
  z.object({ accountType: z.literal("seeker") }),
  z.object({
    accountType: z.enum(["agency", "landlord", "developer"]),
    organizationName: z.string().trim().min(2, "Enter a name (at least 2 characters)").max(120),
    organizationPhone: phone,
  }),
]);

export type OnboardingValues = z.infer<typeof onboardingSchema>;
