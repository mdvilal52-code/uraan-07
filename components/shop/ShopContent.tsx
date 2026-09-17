"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Loader2, Check, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { categories, categoryNameBySlug } from "@/data/jewelleryData";
import type { CategorySlug, Product } from "@/types";

type Filter = "all" | CategorySlug;
type SortKey = "featured" | "price-asc" | "price-desc" | "rating";

const pills: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  ...categories.map((c) => ({ key: c.slug as Filter, label: c.name })),
];

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "rating", label: "Top Rated" },
];

function sortProducts(products: Product[], sort: SortKey): Product[] {
  if (sort === "featured") return products;
  const sorted = [...products];
  if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (sort === "rating") sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  return sorted;
}

export function ShopContent() {
  const params = useSearchParams();
  const initial = (params.get("category") as Filter) ?? "all";
  const [filter, setFilter] = useState<Filter>(
    pills.some((p) => p.key === initial) ? initial : "all",
  );
  const [products, setProducts] = useState<Product[] | null>(null);
  const [sort, setSort] = useState<SortKey>("featured");
  const [sheetOpen, setSheetOpen] = useState(false);

  // Keep the active pill in sync with the URL — a "View All" link (or any
  // link) to /shop?category=X only changes the search params while this
  // component stays mounted, so the initial useState value alone never
  // updates without this.
  useEffect(() => {
    const next = params.get("category") as Filter | null;
    setFilter(next && pills.some((p) => p.key === next) ? next : "all");
  }, [params]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const groups = useMemo(() => {
    if (!products) return [];
    const all = categories.map((c) => ({
      slug: c.slug,
      title: categoryNameBySlug[c.slug] ?? c.name,
      products: sortProducts(
        products.filter((p) => p.category === c.slug),
        sort,
      ),
    }));
    return filter === "all" ? all : all.filter((g) => g.slug === filter);
  }, [products, filter, sort]);

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
            aria-label="Sort products"
            onClick={() => setSheetOpen(true)}
            className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border shadow-card-soft transition ${
              sort !== "featured"
                ? "border-forest-600 bg-forest-600 text-cream-50"
                : "border-cream-300 bg-cream-50 text-ink"
            }`}
          >
            <SlidersHorizontal className="h-[1.15rem] w-[1.15rem]" />
            {sort !== "featured" && (
              <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-clay-500 ring-2 ring-cream-100" />
            )}
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
                  View All
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
              No products in this category yet.
            </p>
          )}
        </div>
      )}

      {/* Sort bottom sheet */}
      <div
        className={`fixed inset-0 z-50 ${sheetOpen ? "" : "pointer-events-none"}`}
        aria-hidden={!sheetOpen}
      >
        <div
          onClick={() => setSheetOpen(false)}
          className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
            sheetOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-x-0 bottom-0 rounded-t-3xl bg-cream-100 shadow-2xl transition-transform duration-300 ease-out ${
            sheetOpen ? "translate-y-0" : "translate-y-full"
          }`}
          role="dialog"
          aria-label="Sort products"
        >
          <div className="flex items-center justify-between border-b border-cream-300 px-5 py-4">
            <h2 className="font-sans text-lg font-bold text-ink">Sort By</h2>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              aria-label="Close"
              className="grid h-9 w-9 place-items-center rounded-xl text-ink transition hover:bg-cream-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-5 py-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            {sortOptions.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => {
                  setSort(o.key);
                  setSheetOpen(false);
                }}
                className="flex w-full items-center justify-between border-b border-cream-200 py-3.5 text-left text-[0.95rem] font-semibold text-ink last:border-b-0"
              >
                {o.label}
                {sort === o.key && (
                  <Check className="h-4 w-4 text-forest-600" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
