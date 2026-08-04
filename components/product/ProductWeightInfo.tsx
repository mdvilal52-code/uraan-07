"use client";

import { useState } from "react";
import { Scale, Gem } from "lucide-react";

/**
 * Weight & karat box on the product page. All values are admin-controlled
 * (set per product in the admin panel). Anything the admin hasn't set is
 * shown as N/A rather than a guessed/estimated number.
 */
export function ProductWeightInfo({
  karats,
  goldWeight,
  totalWeight,
}: {
  karats?: string[];
  goldWeight?: number;
  totalWeight?: number;
}) {
  const options = karats ?? [];
  const [karat, setKarat] = useState<string>(options[0] ?? "");

  const grams = (v?: number) =>
    typeof v === "number" && v > 0 ? `${v.toFixed(1)}g` : "N/A";

  return (
    <div className="mt-4 rounded-2xl border border-cream-300 bg-cream-50 p-4 space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
        <Scale className="h-4 w-4 text-gold-500" />
        تفاصيل الوزن والعيار
      </h3>

      {/* Karat selection (admin-controlled list) */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-ink-soft">العيار:</span>
        {options.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {options.map((k) => (
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
        ) : (
          <span className="text-xs font-bold text-ink-faint" dir="ltr">
            N/A
          </span>
        )}
      </div>

      {/* Weight info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-cream-100 p-3 text-center">
          <Gem className="mx-auto h-4 w-4 text-gold-500" />
          <p className="mt-1 text-[0.65rem] font-semibold text-ink-muted">
            وزن الذهب
          </p>
          <p className="text-sm font-extrabold text-ink" dir="ltr">
            {grams(goldWeight)}
          </p>
        </div>
        <div className="rounded-xl bg-cream-100 p-3 text-center">
          <Scale className="mx-auto h-4 w-4 text-gold-500" />
          <p className="mt-1 text-[0.65rem] font-semibold text-ink-muted">
            الوزن الإجمالي
          </p>
          <p className="text-sm font-extrabold text-ink" dir="ltr">
            {grams(totalWeight)}
          </p>
        </div>
      </div>
    </div>
  );
}
