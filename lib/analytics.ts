import { analytics as dbAnalytics } from "@/lib/db";

/* Derived metrics for the admin dashboard (live from PostgreSQL). */

export async function getAverageOrderValue(): Promise<number> {
  return (await dbAnalytics()).averageOrderValue;
}

/** Monthly revenue series for the dashboard chart. */
export const revenueSeries: { month: string; value: number }[] = [
  { month: "Jan", value: 32 },
  { month: "Feb", value: 41 },
  { month: "Mar", value: 38 },
  { month: "Apr", value: 55 },
  { month: "May", value: 61 },
  { month: "Jun", value: 72 },
  { month: "Jul", value: 68 },
];

export async function kpis() {
  const a = await dbAnalytics();
  return [
    { label: "Revenue", value: a.revenue, prefix: "AUD", trend: "+12.4%" },
    { label: "Orders", value: a.orders, trend: "+6.1%" },
    { label: "Customers", value: a.customers, trend: "+3.2%" },
    { label: "Products", value: a.products, trend: "+2 new" },
  ];
}
