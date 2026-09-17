import { Scale, Gem } from "lucide-react";

/**
 * Weight & karat box on the product page. Weights and karat(s) are
 * admin-controlled (set per product in the admin panel); anything the
 * admin hasn't set falls back to N/A (weights) or 21K (karat). "Arabic
 * Gold" is a fixed storewide badge — it's hardcoded below, never sourced
 * from product data, so it always appears next to the karat badge(s) and
 * can't be changed or removed by editing a product.
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
  const grams = (v?: number) =>
    typeof v === "number" && v > 0 ? `${v.toFixed(1)}g` : "N/A";
  const karatList = karats && karats.length > 0 ? karats : ["21K"];

  return (
    <div className="mt-4 rounded-2xl border border-cream-300 bg-cream-50 p-4 space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
        <Scale className="h-4 w-4 text-gold-500" />
        Weight &amp; Purity Details
      </h3>

      {/* Purity — admin-set karat badge(s) plus the fixed Arabic Gold badge */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-ink-soft">Purity:</span>
        {karatList.map((k) => (
          <span
            key={k}
            className="rounded-xl bg-forest-600 px-3 py-1.5 text-xs font-bold text-cream-50 shadow-sm"
          >
            {k}
          </span>
        ))}
        <span className="rounded-xl bg-gold-gradient px-3 py-1.5 text-xs font-bold text-forest-800 shadow-gold">
          Arabic Gold
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
