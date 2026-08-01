import type { Metadata } from "next";
import { Suspense } from "react";
import { AppShell } from "@/components/AppShell";
import { ShopContent } from "@/components/shop/ShopContent";
import { Footer } from "@/components/Footer";
import { Loader } from "@/components/Loader";

export const metadata: Metadata = {
  title: "المتجر",
  description:
    "تسوّق أجمل المجوهرات والأحجار الكريمة لجميع المناسبات — القلائد والأقراط والخواتم والأساور بأسعار AUD تنافسية.",
};

export default function ShopPage() {
  return (
    <AppShell>
      <header className="px-5 pb-1 pt-5">
        <h1 className="font-arabic text-[1.7rem] font-extrabold text-ink">
          المتجر
        </h1>
        <p className="section-sub mt-1 max-w-xs">
          تسوّق أجمل المجوهرات والأحجار الكريمة لجميع المناسبات.
        </p>
      </header>

      <Suspense fallback={<Loader />}>
        <ShopContent />
      </Suspense>

      <Footer />
    </AppShell>
  );
}
