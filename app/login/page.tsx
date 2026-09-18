import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your Ariana account.",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  // Arriving here via the admin area's own redirect (middleware.ts /
  // app/admin/layout.tsx both send unauthenticated visitors to
  // /login?next=/admin) gets a distinct admin-styled login, not the full
  // customer shopping chrome (guest browsing, account creation, shop nav)
  // that makes no sense for someone trying to reach the back office.
  if (searchParams?.next === "/admin") {
    return <AuthForm mode="login" variant="admin" />;
  }

  return (
    <AppShell>
      <AuthForm mode="login" />
    </AppShell>
  );
}
