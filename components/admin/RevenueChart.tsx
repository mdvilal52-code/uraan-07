import { revenueSeries } from "@/lib/analytics";

export function RevenueChart() {
  const max = Math.max(...revenueSeries.map((d) => d.value));

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-arabic text-base font-bold text-ink">
            الإيرادات الشهرية
          </h3>
          <p className="text-xs text-ink-muted">آخر 7 أشهر (بالآلاف AUD)</p>
        </div>
        <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-bold text-forest-600">
          +12.4%
        </span>
      </div>

      <div className="flex h-44 items-stretch justify-between gap-2">
        {revenueSeries.map((d) => (
          <div key={d.month} className="flex h-full flex-1 flex-col items-center gap-2">
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-lg bg-gold-gradient transition-all"
                style={{ height: `${(d.value / max) * 100}%` }}
                title={`${d.value}K`}
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
