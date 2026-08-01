"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function AddToCartButton({
  productId,
  className = "",
  variant = "forest",
  label = "أضف إلى السلة",
}: {
  productId: string;
  className?: string;
  variant?: "forest" | "gold";
  label?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const base =
    variant === "gold"
      ? "inline-flex items-center justify-center gap-2 rounded-2xl bg-gold-gradient px-6 py-3.5 text-sm font-extrabold text-forest-800 shadow-gold transition active:scale-[0.98]"
      : "btn-forest";

  return (
    <button
      type="button"
      onClick={() => {
        add(productId);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      className={`${base} ${className}`}
    >
      {added ? (
        <>
          <Check className="h-4 w-4" /> تمّت الإضافة
        </>
      ) : (
        <>
          {label}
          <ShoppingCart className="h-4 w-4" />
        </>
      )}
    </button>
  );
}
