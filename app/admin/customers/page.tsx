import { Topbar } from "@/components/admin/Topbar";
import { CustomerTable } from "@/components/admin/CustomerTable";


export const dynamic = "force-dynamic";

export default function AdminCustomersPage() {
  return (
    <>
      <Topbar title="العملاء" />
      <div className="space-y-5 p-4 sm:p-6">
        <p className="text-sm text-ink-muted">قاعدة عملاء أريانا</p>
        <CustomerTable />
      </div>
    </>
  );
}
