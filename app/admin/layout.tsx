import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { getAdminUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "The Ariana admin dashboard for managing products, orders and customers.",
  robots: { index: false, follow: false },
};

// The admin area is never statically served — it must re-check the session
// on every request.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // /admin/forgot-password must stay reachable while signed out — that's
  // the whole point of a forgot-password flow. middleware.ts marks it via
  // this header (a layout has no direct access to the incoming request);
  // the page itself supplies its own full-screen chrome, same as the
  // admin-styled /login variant.
  if (headers().get("x-admin-public-route") === "1") {
    return <>{children}</>;
  }

  // Authoritative server-side gate: verifies the session against the
  // database and requires the admin role. Non-admins (and anonymous users
  // who slipped past middleware) are redirected to login.
  const admin = await getAdminUser();
  if (!admin) {
    redirect("/login?next=/admin");
  }

  return (
    <div className="flex min-h-screen bg-cream-200">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
