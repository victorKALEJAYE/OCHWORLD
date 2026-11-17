import { z } from "zod";

const email = z.string().trim().min(1, "Enter your email").email("Enter a valid email address");

const strongPassword = z
  .string()
  .min(8, "Use at least 8 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

export const accountTypes = ["seeker", "agent"] as const;

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name"),
    email,
    phone: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^(\+?234|0)[789][01]\d{8}$/.test(v.replace(/\s/g, "")), {
        message: "Enter a valid Nigerian phone number",
      }),
    accountType: z.enum(accountTypes),
    password: strongPassword,
    confirmPassword: z.string().min(1, "Confirm your password"),
    acceptTerms: z.boolean().refine((v) => v, { message: "Accept the terms to continue" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

export const forgotPasswordSchema = z.object({ email });

export const updatePasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;

/** 0–4 score used by the password strength meter. */
export function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

/** Only allow redirects to paths inside this site. */
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard") {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
