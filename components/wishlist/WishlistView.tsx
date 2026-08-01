"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/types";

export function WishlistView() {
  const { ids, ready } = useWishlist();
  const [all, setAll] = useState<Product[] | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setAll(d.products ?? []))
      .catch(() => setAll([]));
  }, []);

  if (!all || !ready) {
    return (
      <div className="grid place-items-center py-20 text-ink-muted">
        <Loader2 className="h-7 w-7 animate-spin text-gold-500" />
      </div>
    );
  }

  const wished = all.filter((p) => ids.includes(p.id));

  if (wished.length === 0) {
    return (
      <div className="grid place-items-center px-5 py-20 text-center">
        <Heart className="h-14 w-14 text-cream-400" />
        <p className="mt-4 text-ink-muted">لا توجد عناصر في المفضّلة بعد.</p>
        <Link href="/shop" className="btn-forest mt-5">
          تصفّح المتجر
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3.5 px-5 pb-6">
      {wished.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
