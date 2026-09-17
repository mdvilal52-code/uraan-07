import type { Order } from "@/types";

/* Mock order data used by the admin dashboard. */
export const orders: Order[] = [
  { id: "AR-10241", customer: "Noura Al Qahtani", email: "noura@example.com", total: 4100, status: "paid", date: "2026-07-28", items: 2 },
  { id: "AR-10240", customer: "Sara Al Mansouri", email: "sara@example.com", total: 1650, status: "shipped", date: "2026-07-27", items: 1 },
  { id: "AR-10239", customer: "Reem Al Shamsi", email: "reem@example.com", total: 3250, status: "delivered", date: "2026-07-25", items: 1 },
  { id: "AR-10238", customer: "Mona Al Kaabi", email: "mona@example.com", total: 760, status: "pending", date: "2026-07-24", items: 1 },
  { id: "AR-10237", customer: "Hind Al Ali", email: "hind@example.com", total: 2250, status: "paid", date: "2026-07-23", items: 1 },
  { id: "AR-10236", customer: "Latifa Al Nuaimi", email: "latifa@example.com", total: 925, status: "cancelled", date: "2026-07-22", items: 1 },
];

export function getOrders(): Order[] {
  return orders;
}
