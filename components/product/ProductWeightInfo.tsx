"use client";

import { useState } from "react";
import { Scale, Gem } from "lucide-react";

const KARAT_OPTIONS = ["18K", "22K", "24K"] as const;

const karatMultiplier: Record<string, number> = {
  "18K": 1.0,
  "22K": 1.2,
  "24K": 1.35,
};

function estimateWeight(category: string, price: number): { gold: string; total: string } {
  const baseGrams = Math.max(2, Math.round((price / 180) * 10) / 10);
  const stoneWeight = category === "rings" ? 0.5 : category === "earrings" ? 0.3 : 1.2;
  return {
    gold: baseGrams.toFixed(1),
    total: (baseGrams + stoneWeight).toFixed(1),
  };
}

export function ProductWeightInfo({
  category,
  price,
}: {
  category: string;
  price: number;
}) {
  const [karat, setKarat] = useState<string>("22K");
  const weight = estimateWeight(category, price);

  return (
    <div className="mt-4 rounded-2xl border border-cream-300 bg-cream-50 p-4 space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
        <Scale className="h-4 w-4 text-gold-500" />
        تفاصيل الوزن والعيار
      </h3>

      {/* Karat selection */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-ink-soft">العيار:</span>
        <div className="flex gap-1.5">
          {KARAT_OPTIONS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKarat(k)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                karat === k
                  ? "bg-forest-600 text-cream-50 shadow-sm"
                  : "bg-cream-200 text-ink-soft hover:bg-cream-300"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Weight info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-cream-100 p-3 text-center">
          <Gem className="mx-auto h-4 w-4 text-gold-500" />
          <p className="mt-1 text-[0.65rem] font-semibold text-ink-muted">وزن الذهب</p>
          <p className="text-sm font-extrabold text-ink" dir="ltr">
            {(parseFloat(weight.gold) * (karatMultiplier[karat] ?? 1)).toFixed(1)}g
          </p>
        </div>
        <div className="rounded-xl bg-cream-100 p-3 text-center">
          <Scale className="mx-auto h-4 w-4 text-gold-500" />
          <p className="mt-1 text-[0.65rem] font-semibold text-ink-muted">الوزن الإجمالي</p>
          <p className="text-sm font-extrabold text-ink" dir="ltr">
            {(parseFloat(weight.total) * (karatMultiplier[karat] ?? 1)).toFixed(1)}g
          </p>
        </div>
      </div>
    </div>
  );
}
