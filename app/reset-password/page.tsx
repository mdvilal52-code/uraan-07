import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Choose a new password for your Ariana account.",
  robots: { index: false, follow: false },
};

// Shared by both the customer and admin flows — which account a token
// belongs to is resolved server-side on submit, not from the URL.
export default function ResetPasswordPage() {
  return (
    <AppShell>
      <ResetPasswordForm />
    </AppShell>
  );
}
