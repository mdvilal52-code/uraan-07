import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Topbar } from "@/components/admin/Topbar";
import { AnalyticsCards } from "@/components/admin/AnalyticsCards";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrderTable } from "@/components/admin/OrderTable";
import { ProductImage } from "@/components/ProductImage";
import { getBestSellers } from "@/lib/products";
import { formatPrice } from "@/lib/currency";

const iconByCategory: Record<string, string> = {
  necklaces: "necklace",
  earrings: "earring",
  rings: "ring",
  bracelets: "bracelet",
  pendants: "pendant",
};


export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const top = await getBestSellers(4);

  return (
    <>
      <Topbar title="Dashboard" />
      <div className="space-y-6 p-4 sm:p-6">
        <AnalyticsCards />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div className="card p-5">
            <h3 className="mb-4 font-sans text-base font-bold text-ink">
              Best Sellers
            </h3>
            <div className="space-y-3">
              {top.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <ProductImage
                    src={p.image}
                    surface={p.surface}
                    icon={iconByCategory[p.category] ?? "gem"}
                    ratio="square"
                    rounded="rounded-xl"
                    className="h-10 w-10 shrink-0"
                    label={p.name}
                    sizes="40px"
                  />
                  <span className="flex-1 truncate font-sans text-sm font-semibold text-ink">
                    {p.name}
                  </span>
                  <span className="text-sm font-bold text-ink">
                    {formatPrice(p.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-sans text-base font-bold text-ink">
              Recent Orders
            </h3>
            <Link href="/admin/orders" className="view-all inline-flex items-center gap-1">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <OrderTable limit={5} />
        </div>
      </div>
    </>
  );
}
