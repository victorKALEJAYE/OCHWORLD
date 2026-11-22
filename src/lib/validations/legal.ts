import { z } from "zod";

/** Shared by the legal request form and its server action. Mirrors the database checks. */
export const legalRequestSchema = z
  .object({
    /** Slug of a published service in the legal_services catalogue. */
    serviceSlug: z
      .string({ required_error: "Choose a service" })
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Choose a service")
      .max(60),
    propertyId: z.string().uuid().optional(),
    propertyDetails: z.string().trim().max(500, "Keep this under 500 characters").optional(),
    name: z.string().trim().min(2, "Enter your name").max(100),
    email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address").max(254),
    phone: z
      .string()
      .trim()
      .min(1, "Enter a phone number so the lawyer can call you")
      .max(20)
      .refine((v) => /^(\+?234|0)[789][01]\d{8}$/.test(v.replace(/\s/g, "")), {
        message: "Enter a valid Nigerian phone number",
      }),
    message: z.string().trim().max(2000, "Keep the message under 2,000 characters").optional(),
  })
  .refine((v) => v.propertyId || (v.propertyDetails && v.propertyDetails.length >= 5), {
    path: ["propertyDetails"],
    message: "Tell us which property (address, plot number or district)",
  });

export type LegalRequestValues = z.infer<typeof legalRequestSchema>;
