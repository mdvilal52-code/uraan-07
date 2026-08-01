import { Topbar } from "@/components/admin/Topbar";
import { OrderTable } from "@/components/admin/OrderTable";


export const dynamic = "force-dynamic";

export default function AdminOrdersPage() {
  return (
    <>
      <Topbar title="الطلبات" />
      <div className="space-y-5 p-4 sm:p-6">
        <p className="text-sm text-ink-muted">متابعة وإدارة طلبات العملاء</p>
        <OrderTable />
      </div>
    </>
  );
}
