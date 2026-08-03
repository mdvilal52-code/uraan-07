"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export function BuyNowButton({
  productId,
  className = "",
  label = "اشتري الآن",
}: {
  productId: string;
  className?: string;
  label?: string;
}) {
  const { add } = useCart();
  const router = useRouter();
  const [going, setGoing] = useState(false);

  return (
    <button
      type="button"
      disabled={going}
      onClick={() => {
        setGoing(true);
        add(productId);
        router.push("/checkout");
      }}
      className={`btn-forest disabled:opacity-60 ${className}`}
    >
      {going ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Zap className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}
