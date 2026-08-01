import { Mail } from "lucide-react";
import { listCustomers } from "@/lib/db";
import { formatPrice } from "@/lib/currency";

export async function CustomerTable() {
  const customers = await listCustomers();

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="border-b border-cream-200 text-xs font-bold text-ink-muted">
              <th className="px-4 py-3 text-start">العميل</th>
              <th className="px-4 py-3 text-start">الطلبات</th>
              <th className="px-4 py-3 text-start">إجمالي الإنفاق</th>
              <th className="px-4 py-3 text-start">تاريخ الانضمام</th>
              <th className="px-4 py-3 text-start"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className="border-b border-cream-100 text-sm last:border-0 hover:bg-cream-100/60"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-gradient font-arabic text-sm font-extrabold text-forest-800">
                      {c.name.charAt(0)}
                    </span>
                    <div>
                      <p className="font-arabic font-semibold text-ink">{c.name}</p>
                      <p className="text-[0.7rem] text-ink-faint">{c.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-soft">{c.orders}</td>
                <td className="px-4 py-3 font-bold text-ink">
                  {formatPrice(c.spent)}
                </td>
                <td className="px-4 py-3 text-ink-soft">{c.joined}</td>
                <td className="px-4 py-3">
                  <a
                    href={`mailto:${c.email}`}
                    aria-label="مراسلة"
                    className="grid h-8 w-8 place-items-center rounded-lg bg-cream-100 text-ink-soft transition hover:bg-cream-200"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
