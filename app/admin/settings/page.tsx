import { Topbar } from "@/components/admin/Topbar";
import { SettingsForm } from "@/components/admin/SettingsForm";

export default function AdminSettingsPage() {
  return (
    <>
      <Topbar title="Settings" />
      <div className="max-w-3xl p-4 sm:p-6">
        <SettingsForm />
      </div>
    </>
  );
}
