import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { ShopContent } from "@/components/shop/ShopContent";
import { Footer } from "@/components/Footer";
import { Loader } from "@/components/Loader";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop the finest Arabic gold and gemstone jewellery for every occasion — necklaces, earrings, rings and bracelets at competitive AUD prices.",
};

export default function ShopPage() {
  return (
    <AppShell>
      <header className="px-5 pb-1 pt-5">
        <h1 className="font-sans text-[1.7rem] font-extrabold text-ink">
          Shop
        </h1>
        <p className="section-sub mt-1 max-w-xs">
          Shop the finest Arabic gold and gemstone jewellery for every occasion.
        </p>
      </header>

      <Suspense fallback={<Loader />}>
        <ShopContent />
      </Suspense>

      <Footer />
    </AppShell>
  );
}
