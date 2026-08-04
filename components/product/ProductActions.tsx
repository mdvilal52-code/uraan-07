"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Check, Heart, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

export function ProductActions({ productId }: { productId: string }) {
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);
  const wished = has(productId);

  return (
    <div className="mt-5 space-y-2.5">
      {/* Buy Now — primary */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={buying || loading}
          onClick={() => {
            setBuying(true);
            add(productId);
            // Guests must sign in before buying; send them to login and bring
            // them back to checkout afterwards. The item is already in the cart.
            router.push(user ? "/checkout" : "/login?next=/checkout");
          }}
          className="btn-forest flex-1 disabled:opacity-60"
        >
          {buying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          اشتري الآن
        </button>
        <button
          type="button"
          onClick={() => toggle(productId)}
          aria-pressed={wished}
          aria-label={wished ? "إزالة من المفضّلة" : "إضافة إلى المفضّلة"}
          className={`grid h-[3.1rem] w-[3.1rem] shrink-0 place-items-center rounded-2xl border shadow-card-soft transition active:scale-90 ${
            wished
              ? "border-clay-300 bg-clay-50 text-clay-500"
              : "border-cream-300 bg-cream-50 text-ink"
          }`}
        >
          <Heart
            className="h-5 w-5"
            fill={wished ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Add to Cart — secondary */}
      <button
        type="button"
        onClick={() => {
          add(productId);
          setAdded(true);
          setTimeout(() => setAdded(false), 1500);
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gold-gradient px-6 py-3.5 text-sm font-extrabold text-forest-800 shadow-gold transition active:scale-[0.98]"
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
  );
}
