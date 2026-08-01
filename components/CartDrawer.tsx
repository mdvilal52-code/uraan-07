"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/context/CartContext";

const iconByCategory: Record<string, string> = {
  necklaces: "necklace",
  earrings: "earring",
  rings: "ring",
  bracelets: "bracelet",
  pendants: "pendant",
};

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { priced, setQty, remove } = useCart();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const lines = priced?.lines ?? [];

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute inset-y-0 end-0 flex w-[88%] max-w-[380px] flex-col bg-cream-100 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
        }`}
        role="dialog"
        aria-label="حقيبة التسوّق"
      >
        <div className="flex items-center justify-between border-b border-cream-300 px-5 py-4">
          <h2 className="font-arabic text-lg font-bold text-ink">حقيبة التسوّق</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-xl text-ink transition hover:bg-cream-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-12 w-12 text-cream-400" />
            <p className="font-arabic text-ink-muted">حقيبتك فارغة حاليًا.</p>
            <Link href="/shop" onClick={onClose} className="btn-forest mt-1">
              تصفّح المتجر
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {lines.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3">
                  <ProductImage
                    src={product.image}
                    surface={product.surface}
                    icon={iconByCategory[product.category] ?? "gem"}
                    ratio="square"
                    className="h-20 w-20 shrink-0"
                    rounded="rounded-2xl"
                    label={product.name}
                    sizes="80px"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-arabic text-sm font-bold text-ink">
                        {product.name}
                      </h3>
                      <button
                        onClick={() => remove(product.id)}
                        aria-label="حذف"
                        className="text-ink-faint transition hover:text-clay-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="price mt-1 text-sm">
                      {formatPrice(product.price)}
                    </span>
                    <div className="mt-auto flex items-center gap-2">
                      <div className="flex items-center gap-3 rounded-xl border border-cream-300 bg-cream-50 px-2 py-1">
                        <button
                          onClick={() => setQty(product.id, quantity - 1)}
                          aria-label="نقص"
                          className="text-ink-muted"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-4 text-center text-sm font-bold">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQty(product.id, quantity + 1)}
                          aria-label="زيادة"
                          className="text-ink-muted"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-cream-300 px-5 py-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-arabic text-sm text-ink-muted">
                  المجموع الفرعي
                </span>
                <span className="price text-lg">
                  {formatPrice(priced?.subtotal ?? 0)}
                </span>
              </div>
              <Link href="/checkout" onClick={onClose} className="btn-forest w-full">
                إتمام الشراء
              </Link>
              <button
                onClick={onClose}
                className="mt-2 w-full py-2 text-center text-sm font-semibold text-ink-muted transition hover:text-ink"
              >
                متابعة التسوّق
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
