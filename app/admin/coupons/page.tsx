import { Plus, Ticket, Copy, Trash2 } from "lucide-react";
import { Topbar } from "@/components/admin/Topbar";

const coupons = [
  { code: "ARIANA15", desc: "خصم 15% على كل الطلبات", uses: "128/500", status: "نشط" },
  { code: "BRIDE20", desc: "خصم 20% على مجموعة الزفاف", uses: "42/100", status: "نشط" },
  { code: "WELCOME10", desc: "خصم 10% للعملاء الجدد", uses: "310/∞", status: "نشط" },
  { code: "EID25", desc: "خصم 25% بمناسبة العيد", uses: "0/200", status: "منتهٍ" },
];

export default function AdminCouponsPage() {
  return (
    <>
      <Topbar title="الكوبونات" />
      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-muted">إدارة كوبونات الخصم</p>
          <button className="btn-forest">
            <Plus className="h-4 w-4" />
            كوبون جديد
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {coupons.map((c) => (
            <div key={c.code} className="card flex items-center gap-3 p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold-gradient text-forest-800">
                <Ticket className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold tracking-wider text-ink">
                    {c.code}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                      c.status === "نشط"
                        ? "bg-forest-50 text-forest-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-ink-muted">{c.desc}</p>
                <p className="mt-0.5 text-[0.7rem] text-ink-faint">
                  الاستخدام: {c.uses}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <button aria-label="نسخ" className="grid h-8 w-8 place-items-center rounded-lg bg-cream-100 text-ink-soft transition hover:bg-cream-200">
                  <Copy className="h-4 w-4" />
                </button>
                <button aria-label="حذف" className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
