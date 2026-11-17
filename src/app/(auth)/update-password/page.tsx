import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export const metadata: Metadata = { title: "New password" };

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}
