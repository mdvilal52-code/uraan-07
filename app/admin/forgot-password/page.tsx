import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Admin Password Reset",
  description: "Reset the password for your Ariana admin account.",
  robots: { index: false, follow: false },
};

// Reachable while signed out by design (see middleware.ts and
// app/admin/layout.tsx, which both special-case this exact path).
export default function AdminForgotPasswordPage() {
  return <ForgotPasswordForm variant="admin" />;
}
