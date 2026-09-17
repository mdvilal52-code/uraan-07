import { Topbar } from "@/components/admin/Topbar";
import { BannersPanel } from "@/components/admin/BannersPanel";

export const dynamic = "force-dynamic";

export default function AdminBannersPage() {
  return (
    <>
      <Topbar title="Banners" />
      <div className="p-4 sm:p-6">
        <BannersPanel />
      </div>
    </>
  );
}
