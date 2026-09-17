import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a new Ariana account.",
};

export default function RegisterPage() {
  return (
    <AppShell>
      <AuthForm mode="register" />
    </AppShell>
  );
}
