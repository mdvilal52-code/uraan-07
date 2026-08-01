"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { categories, categoryNameBySlug } from "@/data/jewelleryData";
import type { CategorySlug, Product } from "@/types";

type Filter = "all" | CategorySlug;

const pills: { key: Filter; label: string }[] = [
  { key: "all", label: "الكل" },
  ...categories.map((c) => ({ key: c.slug as Filter, label: c.name })),
];

export function ShopContent() {
  const params = useSearchParams();
  const initial = (params.get("category") as Filter) ?? "all";
  const [filter, setFilter] = useState<Filter>(
    pills.some((p) => p.key === initial) ? initial : "all",
  );
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  const groups = useMemo(() => {
    if (!products) return [];
    const all = categories.map((c) => ({
      slug: c.slug,
      title: categoryNameBySlug[c.slug] ?? c.name,
      products: products.filter((p) => p.category === c.slug),
    }));
    return filter === "all" ? all : all.filter((g) => g.slug === filter);
  }, [products, filter]);

  return (
    <div>
      {/* Filter pills */}
      <div className="sticky top-16 z-20 bg-cream-100/95 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="no-scrollbar flex flex-1 gap-2 overflow-x-auto">
            {pills.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setFilter(p.key)}
                aria-pressed={filter === p.key}
                className={`chip ${filter === p.key ? "chip-active" : "chip-idle"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="تصفية"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-cream-300 bg-cream-50 text-ink shadow-card-soft"
          >
            <SlidersHorizontal className="h-[1.15rem] w-[1.15rem]" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {!products && (
        <div className="grid place-items-center py-20 text-ink-muted">
          <Loader2 className="h-7 w-7 animate-spin text-gold-500" />
        </div>
      )}

      {/* Category sections */}
      {products && (
        <div className="space-y-7 px-5 pb-6 pt-2">
          {groups.map((g) => (
            <section key={g.slug}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="section-title">{g.title}</h2>
                <Link href={`/shop?category=${g.slug}`} className="view-all">
                  عرض الكل
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                {g.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          ))}

          {groups.every((g) => g.products.length === 0) && (
            <p className="py-16 text-center text-ink-muted">
              لا توجد منتجات في هذه الفئة حاليًا.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
