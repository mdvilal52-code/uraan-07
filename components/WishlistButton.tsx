"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

export function WishlistButton({
  className = "h-10 w-10 rounded-full bg-cream-50/90 shadow-card-soft backdrop-blur",
}: {
  className?: string;
}) {
  const [wished, setWished] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setWished((w) => !w)}
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
