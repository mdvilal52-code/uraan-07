"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { categoryNameBySlug } from "@/data/jewelleryData";
import { formatPrice } from "@/lib/currency";
import type { Product } from "@/types";

const iconByCategory: Record<string, string> = {
  necklaces: "necklace",
  earrings: "earring",
  rings: "ring",
  bracelets: "bracelet",
  pendants: "pendant",
};

export function ProductTable() {
  const [items, setItems] = useState<Product[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = () =>
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setItems(d.products ?? []))
      .catch(() => setItems([]));

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("حذف هذا المنتج؟")) return;
    setBusy(id);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    await load();
    setBusy(null);
  }

  if (!items) {
    return (
      <div className="card grid place-items-center py-16 text-ink-muted">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-start">
          <thead>
            <tr className="border-b border-cream-200 text-start text-xs font-bold text-ink-muted">
              <th className="px-4 py-3 text-start">المنتج</th>
              <th className="px-4 py-3 text-start">الفئة</th>
              <th className="px-4 py-3 text-start">السعر</th>
              <th className="px-4 py-3 text-start">الحالة</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-cream-100 text-sm last:border-0 hover:bg-cream-100/60 ${busy === p.id ? "opacity-50" : ""}`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProductImage
                      src={p.image}
                      surface={p.surface}
                      icon={iconByCategory[p.category] ?? "gem"}
                      ratio="square"
                      rounded="rounded-xl"
                      className="h-11 w-11 shrink-0"
                      label={p.name}
                      sizes="44px"
                    />
                    <div>
                      <p className="font-arabic font-bold text-ink">{p.name}</p>
                      <p className="text-[0.7rem] text-ink-faint">{p.latin}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {categoryNameBySlug[p.category]}
                </td>
                <td className="px-4 py-3 font-bold text-ink">
                  {formatPrice(p.price)}
                </td>
                <td className="px-4 py-3">
                  {p.bestSeller ? (
                    <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-[0.7rem] font-bold text-forest-600">
                      الأكثر مبيعًا
                    </span>
                  ) : p.newArrival ? (
                    <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-[0.7rem] font-bold text-gold-700">
                      وصل حديثًا
                    </span>
                  ) : (
                    <span className="text-[0.7rem] text-ink-faint">متاح</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/admin/products/edit/${p.id}`}
                      aria-label="تعديل"
                      className="grid h-8 w-8 place-items-center rounded-lg bg-cream-100 text-ink-soft transition hover:bg-cream-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => remove(p.id)}
                      aria-label="حذف"
                      className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
