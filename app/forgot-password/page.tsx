import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset the password for your Ariana account.",
};

export default function ForgotPasswordPage() {
  return (
    <AppShell>
      <ForgotPasswordForm />
    </AppShell>
  );
}
