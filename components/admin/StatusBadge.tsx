import type { Order } from "@/types";

const map: Record<Order["status"], { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-700" },
  paid: { label: "Paid", cls: "bg-forest-50 text-forest-600" },
  shipped: { label: "Shipped", cls: "bg-blue-100 text-blue-700" },
  delivered: { label: "Delivered", cls: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-600" },
};

export function StatusBadge({ status }: { status: Order["status"] }) {
  const s = map[status];
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
