"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Minus, Trash2, ShoppingBag, Tag } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { products } from "@/data/jewelleryData";
import { formatPrice } from "@/lib/currency";

const iconByCategory: Record<string, string> = {
  necklaces: "necklace",
  earrings: "earring",
  rings: "ring",
  bracelets: "bracelet",
  pendants: "pendant",
};

const initial = [
  { id: "nk-diamond-maas", qty: 1 },
  { id: "er-maas", qty: 2 },
  { id: "rg-solitaire", qty: 1 },
];

export function CartView() {
  const [lines, setLines] = useState(initial);

  const rows = lines
    .map((l) => ({ product: products.find((p) => p.id === l.id)!, qty: l.qty }))
    .filter((r) => r.product);

  const subtotal = rows.reduce((s, r) => s + r.product.price * r.qty, 0);
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 25;
  const total = subtotal + shipping;

  const setQty = (id: string, delta: number) =>
    setLines((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, qty: Math.max(1, l.qty + delta) } : l,
      ),
    );
  const remove = (id: string) =>
    setLines((prev) => prev.filter((l) => l.id !== id));

  if (rows.length === 0) {
    return (
      <div className="grid place-items-center px-5 py-20 text-center">
        <ShoppingBag className="h-14 w-14 text-cream-400" />
        <h2 className="mt-4 font-arabic text-lg font-bold text-ink">
          سلّتك فارغة
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          أضِف بعض القطع الفاخرة لتبدأ التسوّق.
        </p>
        <Link href="/shop" className="btn-forest mt-5">
          تصفّح المتجر
        </Link>
      </div>
    );
  }

  return (
    <div className="px-5 pb-6">
      <div className="space-y-3">
        {rows.map(({ product, qty }) => (
          <div key={product.id} className="card flex gap-3 p-3">
            <ProductImage
              surface={product.surface}
              icon={iconByCategory[product.category] ?? "gem"}
              ratio="square"
              rounded="rounded-2xl"
              className="h-24 w-24 shrink-0"
              label={product.name}
            />
            <div className="flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/product/${product.id}`}
                  className="font-arabic text-[0.98rem] font-bold text-ink"
                >
                  {product.name}
                </Link>
                <button
                  onClick={() => remove(product.id)}
                  aria-label="حذف"
                  className="text-ink-faint transition hover:text-clay-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <span className="price mt-1 text-base">
                {formatPrice(product.price)}
              </span>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-3 rounded-xl border border-cream-300 bg-cream-50 px-2 py-1">
                  <button
                    onClick={() => setQty(product.id, -1)}
                    aria-label="نقص"
                    className="text-ink-muted"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-5 text-center text-sm font-bold">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty(product.id, 1)}
                    aria-label="زيادة"
                    className="text-ink-muted"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="price text-sm">
                  {formatPrice(product.price * qty)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promo */}
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-gold-300 bg-cream-50 p-2 ps-3">
        <Tag className="h-4 w-4 text-gold-500" />
        <input
          placeholder="كود الخصم"
          aria-label="كود الخصم"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
        />
        <button className="rounded-xl bg-cream-200 px-4 py-2 text-sm font-bold text-ink">
          تطبيق
        </button>
      </div>

      {/* Summary */}
      <div className="card mt-4 space-y-2 p-4">
        <Row label="المجموع الفرعي" value={formatPrice(subtotal)} />
        <Row
          label="الشحن"
          value={shipping === 0 ? "مجّاني" : formatPrice(shipping)}
        />
        <div className="hr-gold my-1" />
        <div className="flex items-center justify-between">
          <span className="font-arabic font-bold text-ink">الإجمالي</span>
          <span className="price text-xl">{formatPrice(total)}</span>
        </div>
      </div>

      <Link href="/checkout" className="btn-forest mt-4 w-full">
        إتمام الشراء
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="font-semibold text-ink">{value}</span>
    </div>
  );
}
