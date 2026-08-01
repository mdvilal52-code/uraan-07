import { Eye } from "lucide-react";
import { getOrders } from "@/lib/orders";
import { StatusBadge } from "./StatusBadge";
import { formatPrice } from "@/lib/currency";

export function OrderTable({ limit }: { limit?: number }) {
  const orders = getOrders().slice(0, limit ?? undefined);

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-cream-200 text-xs font-bold text-ink-muted">
              <th className="px-4 py-3 text-start">رقم الطلب</th>
              <th className="px-4 py-3 text-start">العميل</th>
              <th className="px-4 py-3 text-start">التاريخ</th>
              <th className="px-4 py-3 text-start">العناصر</th>
              <th className="px-4 py-3 text-start">الإجمالي</th>
              <th className="px-4 py-3 text-start">الحالة</th>
              <th className="px-4 py-3 text-start"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-b border-cream-100 text-sm last:border-0 hover:bg-cream-100/60"
              >
                <td className="px-4 py-3 font-bold text-ink">{o.id}</td>
                <td className="px-4 py-3">
                  <p className="font-arabic font-semibold text-ink">{o.customer}</p>
                  <p className="text-[0.7rem] text-ink-faint">{o.email}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">{o.date}</td>
                <td className="px-4 py-3 text-ink-soft">{o.items}</td>
                <td className="px-4 py-3 font-bold text-ink">
                  {formatPrice(o.total)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-3">
                  <button
                    aria-label="عرض"
                    className="grid h-8 w-8 place-items-center rounded-lg bg-cream-100 text-ink-soft transition hover:bg-cream-200"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
