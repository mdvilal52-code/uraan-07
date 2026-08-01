import { orders } from "./orders";
import { customers } from "./users";
import { products } from "@/data/jewelleryData";

/* Derived metrics for the admin analytics dashboard. */

export function getRevenue(): number {
  return orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
}

export function getOrderCount(): number {
  return orders.length;
}

export function getCustomerCount(): number {
  return customers.length;
}

export function getProductCount(): number {
  return products.length;
}

export function getAverageOrderValue(): number {
  const valid = orders.filter((o) => o.status !== "cancelled");
  if (valid.length === 0) return 0;
  return Math.round(getRevenue() / valid.length);
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

export const kpis = () => [
  { label: "الإيرادات", value: getRevenue(), prefix: "AUD", trend: "+12.4%" },
  { label: "الطلبات", value: getOrderCount(), trend: "+6.1%" },
  { label: "العملاء", value: getCustomerCount(), trend: "+3.2%" },
  { label: "المنتجات", value: getProductCount(), trend: "+2 جديد" },
];
