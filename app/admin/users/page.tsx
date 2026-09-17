import { Topbar } from "@/components/admin/Topbar";
import { UsersTable } from "@/components/admin/UsersTable";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <>
      <Topbar title="Users" />
      <div className="space-y-5 p-4 sm:p-6">
        <p className="text-sm text-ink-muted">
          Registered accounts — toggle admin access or remove an account.
        </p>
        <UsersTable />
      </div>
    </>
  );
}
