"use client";

import { useMemo, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { searchProducts, getBestSellers } from "@/lib/products";
import { categories } from "@/data/jewelleryData";
import Link from "next/link";

const suggestions = ["ألماس", "ذهب", "قلادة", "خاتم", "زفاف", "زمرّد"];

export function SearchView() {
  const [q, setQ] = useState("");
  const results = useMemo(() => searchProducts(q), [q]);
  const trimmed = q.trim();

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
        {q && (
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

          <div className="mt-6">
            <p className="mb-3 font-arabic text-lg font-bold text-ink">
              الأكثر مبيعًا
            </p>
            <div className="grid grid-cols-2 gap-3.5">
              {getBestSellers(4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </>
      )}

      {trimmed && (
        <div className="mt-5">
          <p className="mb-3 text-sm text-ink-muted">
            {results.length} نتيجة عن «{trimmed}»
          </p>
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-3.5">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="py-16 text-center text-ink-muted">
              لا توجد نتائج مطابقة. جرّب كلمة أخرى.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
