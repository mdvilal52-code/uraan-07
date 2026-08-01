import type { Metadata } from "next";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { WishlistView } from "@/components/wishlist/WishlistView";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "المفضّلة",
  description: "قطعك المفضّلة المحفوظة في مكان واحد.",
};

export default function WishlistPage() {
  return (
    <AppShell>
      <header className="flex items-center gap-2 px-5 pb-3 pt-5">
        <Heart className="h-6 w-6 text-clay-500" fill="currentColor" />
        <h1 className="font-arabic text-[1.7rem] font-extrabold text-ink">
          المفضّلة
        </h1>
      </header>
      <WishlistView />
      <Footer />
    </AppShell>
  );
}
