"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Check, Heart } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { formatPrice } from "@/lib/currency";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { Product } from "@/types";

const iconByCategory: Record<string, string> = {
  necklaces: "necklace",
  earrings: "earring",
  rings: "ring",
  bracelets: "bracelet",
  pendants: "pendant",
};

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const [added, setAdded] = useState(false);
  const wished = has(product.id);

  return (
    <article className="card press flex flex-col overflow-hidden">
      <div className="relative">
        <Link href={`/product/${product.id}`} aria-label={product.name}>
          <ProductImage
            src={product.image}
            surface={product.surface}
            icon={iconByCategory[product.category] ?? "gem"}
            ratio="landscape"
            rounded="rounded-none"
            label={product.name}
          />
        </Link>

        <button
          type="button"
          onClick={() => toggle(product.id)}
          aria-label={wished ? "إزالة من المفضّلة" : "إضافة إلى المفضّلة"}
          aria-pressed={wished}
          className="absolute end-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-cream-50/90 text-ink shadow-card-soft backdrop-blur transition active:scale-90"
        >
          <Heart
            className={`h-[1.05rem] w-[1.05rem] transition ${wished ? "text-clay-500" : ""}`}
            fill={wished ? "currentColor" : "none"}
          />
        </button>

        {product.newArrival && (
          <span className="absolute start-2.5 top-2.5 rounded-full bg-gold-gradient px-2.5 py-1 text-[0.62rem] font-extrabold text-forest-800 shadow-gold">
            وصل حديثًا
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-arabic text-[1.02rem] font-bold leading-snug text-ink">
            {product.name}
          </h3>
        </Link>
        <span className="price mt-1 text-[1.02rem]">{formatPrice(product.price)}</span>

        <button
          type="button"
          onClick={() => {
            add(product.id);
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
          className={`btn-forest mt-3 w-full ${added ? "bg-forest-700" : ""}`}
        >
          {added ? (
            <>
              <Check className="h-4 w-4" /> تمّت الإضافة
            </>
          ) : (
            <>
              أضف إلى السلة
              <ShoppingCart className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </article>
  );
}
