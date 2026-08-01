"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

export function WishlistButton({
  productId,
  className = "h-10 w-10 rounded-full bg-cream-50/90 shadow-card-soft backdrop-blur",
}: {
  productId: string;
  className?: string;
}) {
  const { has, toggle } = useWishlist();
  const wished = has(productId);

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={wished}
      aria-label={wished ? "إزالة من المفضّلة" : "إضافة إلى المفضّلة"}
      className={`grid place-items-center text-ink transition active:scale-90 ${className}`}
    >
      <Heart
        className={`h-[1.15rem] w-[1.15rem] transition ${wished ? "text-clay-500" : ""}`}
        fill={wished ? "currentColor" : "none"}
      />
    </button>
  );
}
