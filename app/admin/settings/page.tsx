import { Topbar } from "@/components/admin/Topbar";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { TwoFactorCard } from "@/components/admin/TwoFactorCard";

export default function AdminSettingsPage() {
  return (
    <>
      <Topbar title="Settings" />
      <div className="max-w-3xl space-y-5 p-4 sm:p-6">
        <SettingsForm />
        <TwoFactorCard />
      </div>
    </>
  );
}
