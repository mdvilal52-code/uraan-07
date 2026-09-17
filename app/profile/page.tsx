import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ProfileView } from "@/components/profile/ProfileView";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your account, orders and preferences.",
};

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileView />
      <Footer />
    </AppShell>
  );
}
