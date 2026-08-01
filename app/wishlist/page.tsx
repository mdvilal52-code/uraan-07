import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { getBestSellers } from "@/lib/products";

export const metadata: Metadata = {
  title: "المفضّلة",
  description: "قطعك المفضّلة المحفوظة في مكان واحد.",
};

export default function WishlistPage() {
  const items = getBestSellers();

  return (
    <AppShell>
      <header className="flex items-center gap-2 px-5 pb-3 pt-5">
        <Heart className="h-6 w-6 text-clay-500" fill="currentColor" />
        <h1 className="font-arabic text-[1.7rem] font-extrabold text-ink">
          المفضّلة
        </h1>
      </header>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3.5 px-5 pb-6" data-reveal-stagger>
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="grid place-items-center px-5 py-20 text-center">
          <Heart className="h-14 w-14 text-cream-400" />
          <p className="mt-4 text-ink-muted">لا توجد عناصر في المفضّلة بعد.</p>
          <Link href="/shop" className="btn-forest mt-5">
            تصفّح المتجر
          </Link>
        </div>
      )}

      <Footer />
    </AppShell>
  );
}
