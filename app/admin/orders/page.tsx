import { Topbar } from "@/components/admin/Topbar";
import { OrderTable } from "@/components/admin/OrderTable";


export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return (
    <>
      <Topbar title="Orders" />
      <div className="space-y-5 p-4 sm:p-6">
        <p className="text-sm text-ink-muted">Track and manage customer orders</p>
        <OrderTable />
      </div>
    </>
  );
}
