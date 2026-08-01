"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon, X, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { categories } from "@/data/jewelleryData";
import type { Product } from "@/types";

const suggestions = ["ألماس", "ذهب", "قلادة", "خاتم", "زفاف", "زمرّد"];

export function SearchView() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const trimmed = q.trim();

  // best sellers for the idle state
  useEffect(() => {
    fetch("/api/products?bestSeller=true&limit=4")
      .then((r) => r.json())
      .then((d) => setFeatured(d.products ?? []))
      .catch(() => {});
  }, []);

  // debounced search
  useEffect(() => {
    if (!trimmed) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/products?q=${encodeURIComponent(trimmed)}`)
        .then((r) => r.json())
        .then((d) => setResults(d.products ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [trimmed]);

  return (
    <div className="px-5 pb-6">
      <div className="flex items-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 shadow-card-soft">
        <SearchIcon className="h-5 w-5 text-ink-muted" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن المجوهرات والأحجار…"
          aria-label="بحث"
          className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-gold-500" />}
        {q && !loading && (
          <button onClick={() => setQ("")} aria-label="مسح">
            <X className="h-4 w-4 text-ink-muted" />
          </button>
        )}
      </div>

      {!trimmed && (
        <>
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-600">
              بحث شائع
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setQ(s)}
                  className="chip chip-idle text-[0.82rem]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gold-600">
              تصفّح الفئات
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/shop?category=${c.slug}`}
                  className="chip chip-idle text-[0.82rem]"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {featured.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 font-arabic text-lg font-bold text-ink">
                الأكثر مبيعًا
              </p>
              <div className="grid grid-cols-2 gap-3.5">
                {featured.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {trimmed && (
        <div className="mt-5">
          <p className="mb-3 text-sm text-ink-muted">
            {loading ? "جارٍ البحث…" : `${results.length} نتيجة عن «${trimmed}»`}
          </p>
          {!loading && results.length > 0 && (
            <div className="grid grid-cols-2 gap-3.5">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          {!loading && results.length === 0 && (
            <p className="py-16 text-center text-ink-muted">
              لا توجد نتائج مطابقة. جرّب كلمة أخرى.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
