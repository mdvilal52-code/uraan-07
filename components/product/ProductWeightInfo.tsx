import { Scale, Gem } from "lucide-react";

/**
 * Weight & karat box on the product page. Weights are admin-controlled
 * (set per product in the admin panel); anything the admin hasn't set is
 * shown as N/A. Purity is fixed storewide — every piece is 21K + Arabic
 * Gold, so it's shown as a static label rather than a per-product choice.
 */
export function ProductWeightInfo({
  goldWeight,
  totalWeight,
}: {
  goldWeight?: number;
  totalWeight?: number;
}) {
  const grams = (v?: number) =>
    typeof v === "number" && v > 0 ? `${v.toFixed(1)}g` : "N/A";

  return (
    <div className="mt-4 rounded-2xl border border-cream-300 bg-cream-50 p-4 space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
        <Scale className="h-4 w-4 text-gold-500" />
        Weight &amp; Purity Details
      </h3>

      {/* Purity — fixed storewide, not admin-configurable */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-ink-soft">Purity:</span>
        <span className="rounded-xl bg-forest-600 px-3 py-1.5 text-xs font-bold text-cream-50 shadow-sm">
          21K + Arabic Gold
        </span>
      </div>

      {/* Weight info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-cream-100 p-3 text-center">
          <Gem className="mx-auto h-4 w-4 text-gold-500" />
          <p className="mt-1 text-[0.65rem] font-semibold text-ink-muted">
            Gold Weight
          </p>
          <p className="text-sm font-extrabold text-ink">
            {grams(goldWeight)}
          </p>
        </div>
        <div className="rounded-xl bg-cream-100 p-3 text-center">
          <Scale className="mx-auto h-4 w-4 text-gold-500" />
          <p className="mt-1 text-[0.65rem] font-semibold text-ink-muted">
            Total Weight
          </p>
          <p className="text-sm font-extrabold text-ink">
            {grams(totalWeight)}
          </p>
        </div>
      </div>
    </div>
  );
}
