"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Coins } from "lucide-react";

interface GoldRateRow {
  purity: string;
  pricePerGram: number;
  currency: string;
  updatedAt: string;
  updatedBy?: string;
}

const inputCls =
  "w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-400 placeholder:text-ink-faint";

function formatUpdated(row: GoldRateRow): string {
  if (row.pricePerGram <= 0) return "Not set yet";
  const date = new Date(row.updatedAt).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return row.updatedBy ? `Updated ${date} by ${row.updatedBy}` : `Updated ${date}`;
}

/** Admin-configurable gold price per purity (Settings → Gold Rate). Products
 *  set to "Gold Rate Based" pricing (Products → pricing type) compute their
 *  live price as goldWeight × the matching row here — see
 *  lib/db.ts effectivePrice()/withEffectivePrices(). Nothing here ever
 *  touches a product with Fixed pricing. */
export function GoldRatePanel() {
  const [rates, setRates] = useState<GoldRateRow[] | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/gold-rate")
      .then((r) => r.json())
      .then((d) => {
        setRates(d.rates ?? []);
        setProductCount(d.goldRateProductCount ?? 0);
      })
      .catch(() => setRates([]));
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const updated = (rates ?? []).map((r) => ({
      purity: r.purity,
      pricePerGram: Number(fd.get(`rate-${r.purity}`)) || 0,
    }));
    const res = await fetch("/api/admin/gold-rate", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rates: updated }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Unable to save gold rates");
      return;
    }
    const data = await res.json();
    setRates(data.rates ?? updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!rates) {
    return (
      <div className="card grid place-items-center py-16 text-ink-muted">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-5">
      <div className="card space-y-1 p-4">
        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <Coins className="h-4 w-4 text-gold-500" />
          Rate per gram, by purity. Products set to{" "}
          <strong className="text-ink">Gold Rate Based</strong> pricing (on
          the product form) compute their live price from these rates ×
          their gold weight — nothing is hardcoded on the product card.
        </p>
        <p className="text-xs text-ink-faint">
          {productCount ?? 0} product{productCount === 1 ? "" : "s"}{" "}
          currently use{productCount === 1 ? "s" : ""} gold-rate pricing.
        </p>
      </div>

      <div className="card space-y-4 p-5">
        {rates.map((r) => (
          <div key={r.purity} className="grid grid-cols-[4rem_1fr] items-start gap-4">
            <span className="mt-3 font-sans text-sm font-extrabold text-ink">
              {r.purity}
            </span>
            <label className="block">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-sm text-ink-faint">
                  {r.currency}
                </span>
                <input
                  name={`rate-${r.purity}`}
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={r.pricePerGram || ""}
                  placeholder="0.00"
                  className={`${inputCls} ps-14`}
                />
                <span className="pointer-events-none absolute inset-y-0 end-4 flex items-center text-xs text-ink-faint">
                  / gram
                </span>
              </div>
              <span className="mt-1 block text-[0.7rem] text-ink-faint">
                {formatUpdated(r)}
              </span>
            </label>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="btn-forest w-full sm:w-auto disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {saving ? "Saving…" : saved ? "Saved" : "Save Gold Rates"}
      </button>
    </form>
  );
}
