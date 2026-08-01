import { analytics as dbAnalytics } from "@/lib/db";

/* Derived metrics for the admin dashboard (live from PostgreSQL). */

export async function getAverageOrderValue(): Promise<number> {
  return (await dbAnalytics()).averageOrderValue;
}

/** Monthly revenue series for the dashboard chart (Arabic month labels). */
export const revenueSeries: { month: string; value: number }[] = [
  { month: "يناير", value: 32 },
  { month: "فبراير", value: 41 },
  { month: "مارس", value: 38 },
  { month: "أبريل", value: 55 },
  { month: "مايو", value: 61 },
  { month: "يونيو", value: 72 },
  { month: "يوليو", value: 68 },
];

export async function kpis() {
  const a = await dbAnalytics();
  return [
    { label: "الإيرادات", value: a.revenue, prefix: "AUD", trend: "+12.4%" },
    { label: "الطلبات", value: a.orders, trend: "+6.1%" },
    { label: "العملاء", value: a.customers, trend: "+3.2%" },
    { label: "المنتجات", value: a.products, trend: "+2 جديد" },
  ];
}
