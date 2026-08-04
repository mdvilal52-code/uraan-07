import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { getAdminUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "لوحة الإدارة",
  description: "لوحة تحكّم أريانا لإدارة المنتجات والطلبات والعملاء.",
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
