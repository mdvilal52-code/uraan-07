import { revenueSeries } from "@/lib/analytics";
import { formatPrice } from "@/lib/currency";

export async function RevenueChart() {
  const series = await revenueSeries();
  const max = Math.max(1, ...series.map((d) => d.value));
  const total = series.reduce((s, d) => s + d.value, 0);

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-sans text-base font-bold text-ink">
            Monthly Revenue
          </h3>
          <p className="text-xs text-ink-muted">Last 7 months</p>
        </div>
        <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-bold text-forest-600">
          {formatPrice(total)}
        </span>
      </div>

      <div className="flex h-44 items-stretch justify-between gap-2">
        {series.map((d) => (
          <div key={d.month} className="flex h-full flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-lg bg-gold-gradient transition-all"
                style={{ height: `${(d.value / max) * 100}%` }}
                title={formatPrice(d.value)}
              />
            </div>
            <span className="text-[0.62rem] font-semibold text-ink-muted">
              {d.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
