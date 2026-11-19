import { z } from "zod";

/** Shared by the enquiry form (client) and the server action. Mirrors the DB checks. */
export const enquirySchema = z.object({
  propertyId: z.string().uuid(),
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().min(1, "Enter your email").email("Enter a valid email address").max(254),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .refine((v) => !v || /^(\+?234|0)[789][01]\d{8}$/.test(v.replace(/\s/g, "")), {
      message: "Enter a valid Nigerian phone number",
    }),
  message: z.string().trim().min(10, "Tell the agent a little more (at least 10 characters)").max(2000),
});

export type EnquiryValues = z.infer<typeof enquirySchema>;
