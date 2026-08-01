import { Topbar } from "@/components/admin/Topbar";
import { AnalyticsCards } from "@/components/admin/AnalyticsCards";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { getProductsGroupedByCategory } from "@/lib/products";
import { getAverageOrderValue } from "@/lib/analytics";
import { formatPrice } from "@/lib/currency";


export const dynamic = "force-dynamic";

export default function AdminAnalyticsPage() {
  const groups = getProductsGroupedByCategory();
  const totalProducts = groups.reduce((s, g) => s + g.products.length, 0);

  return (
    <>
      <Topbar title="التحليلات" />
      <div className="space-y-6 p-4 sm:p-6">
        <AnalyticsCards />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>

          <div className="card p-5">
            <h3 className="mb-4 font-arabic text-base font-bold text-ink">
              التوزيع حسب الفئة
            </h3>
            <div className="space-y-3">
              {groups.map((g) => {
                const pct = Math.round(
                  (g.products.length / Math.max(totalProducts, 1)) * 100,
                );
                return (
                  <div key={g.slug}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink">{g.title}</span>
                      <span className="text-ink-muted">{g.products.length}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-cream-200">
                      <div
                        className="h-full rounded-full bg-gold-gradient"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "متوسط قيمة الطلب", value: formatPrice(getAverageOrderValue()) },
            { label: "معدّل التحويل", value: "3.8%" },
            { label: "العملاء العائدون", value: "62%" },
          ].map((s) => (
            <div key={s.label} className="card p-5">
              <p className="font-arabic text-2xl font-extrabold text-ink">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
