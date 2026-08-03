import { Topbar } from "@/components/admin/Topbar";
import { CouponTable } from "@/components/admin/CouponTable";

export default function AdminCouponsPage() {
  return (
    <>
      <Topbar title="الكوبونات" />
      <div className="space-y-5 p-4 sm:p-6">
        <CouponTable />
      </div>
    </>
  );
}
