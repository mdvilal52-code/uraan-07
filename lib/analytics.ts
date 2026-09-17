import { analytics as dbAnalytics, analyticsWithTrends, monthlyRevenue } from "@/lib/db";

/* Derived metrics for the admin dashboard — all live from PostgreSQL. */

export async function getAverageOrderValue(): Promise<number> {
  return (await dbAnalytics()).averageOrderValue;
}

/** Monthly revenue series for the dashboard chart (real order totals,
 *  last 7 months). */
export async function revenueSeries(): Promise<{ month: string; value: number }[]> {
  return monthlyRevenue(7);
}

export async function kpis() {
  const a = await analyticsWithTrends();
  return [
    { label: "Revenue", value: a.revenue, prefix: "AUD", trend: a.revenueTrend },
    { label: "Orders", value: a.orders, trend: a.ordersTrend },
    { label: "Customers", value: a.customers, trend: a.customersTrend },
    { label: "Products", value: a.products, trend: a.productsTrend },
  ];
}
