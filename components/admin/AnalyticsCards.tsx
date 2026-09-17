import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { kpis } from "@/lib/analytics";
import { formatAmount } from "@/lib/currency";

const icons = [DollarSign, ShoppingCart, Users, Package];

export async function AnalyticsCards() {
  const data = await kpis();

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {data.map((k, i) => {
        const Icon = icons[i] ?? DollarSign;
        const isDown = k.trend.startsWith("-");
        const isFlat = k.trend === "—";
        return (
          <div key={k.label} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cream-100 text-gold-500">
                <Icon className="h-5 w-5" />
              </span>
              {!isFlat && (
                <span
                  className={`inline-flex items-center gap-1 text-[0.7rem] font-bold ${isDown ? "text-red-500" : "text-forest-500"}`}
                >
                  {isDown ? (
                    <TrendingDown className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingUp className="h-3.5 w-3.5" />
                  )}
                  {k.trend}
                </span>
              )}
            </div>
            <p className="mt-3 font-sans text-2xl font-extrabold text-ink">
              {k.prefix ? `${k.prefix} ` : ""}
              {formatAmount(k.value)}
            </p>
            <p className="text-xs text-ink-muted">{k.label}</p>
          </div>
        );
      })}
    </div>
  );
}
