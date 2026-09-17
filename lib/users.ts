import type { Customer } from "@/types";

/* Mock customer data used by the admin dashboard. */
export const customers: Customer[] = [
  { id: "C-501", name: "Noura Al Qahtani", email: "noura@example.com", orders: 6, spent: 14200, joined: "2025-11-02" },
  { id: "C-502", name: "Sara Al Mansouri", email: "sara@example.com", orders: 3, spent: 5400, joined: "2026-01-18" },
  { id: "C-503", name: "Reem Al Shamsi", email: "reem@example.com", orders: 8, spent: 21750, joined: "2025-08-09" },
  { id: "C-504", name: "Mona Al Kaabi", email: "mona@example.com", orders: 1, spent: 760, joined: "2026-06-30" },
  { id: "C-505", name: "Hind Al Ali", email: "hind@example.com", orders: 4, spent: 9100, joined: "2026-03-14" },
];

export function getCustomers(): Customer[] {
  return customers;
}
