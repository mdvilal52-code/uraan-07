import { Topbar } from "@/components/admin/Topbar";
import { GoldRatePanel } from "@/components/admin/GoldRatePanel";

export default function AdminGoldRatePage() {
  return (
    <>
      <Topbar title="Gold Rate" />
      <div className="space-y-5 p-4 sm:p-6">
        <GoldRatePanel />
      </div>
    </>
  );
}
