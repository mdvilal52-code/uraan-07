import { Star, Check, Trash2 } from "lucide-react";
import { Topbar } from "@/components/admin/Topbar";

const reviews = [
  { id: "r1", name: "نورة القحطاني", product: "قلادة ماس ألماسي", rating: 5, text: "قطعة فاخرة وجودة استثنائية.", status: "منشور" },
  { id: "r2", name: "سارة المنصوري", product: "خاتم سوليتير", rating: 5, text: "الألماس نظيف والتصميم أنيق جدًا.", status: "منشور" },
  { id: "r3", name: "منى الكعبي", product: "أقراط ماس", rating: 4, text: "جميلة لكن التوصيل تأخّر قليلًا.", status: "قيد المراجعة" },
  { id: "r4", name: "ريم الشامسي", product: "سوار ألماسي", rating: 5, text: "خدمة راقية وتغليف فخم.", status: "قيد المراجعة" },
];

export default function AdminReviewsPage() {
  return (
    <>
      <Topbar title="التقييمات" />
      <div className="space-y-4 p-4 sm:p-6">
        <p className="text-sm text-ink-muted">مراجعة وإدارة تقييمات العملاء</p>
        {reviews.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-arabic font-bold text-ink">{r.name}</span>
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < r.rating ? "text-gold-400" : "text-cream-300"}`}
                        fill="currentColor"
                      />
                    ))}
                  </span>
                </div>
                <p className="text-xs text-ink-muted">{r.product}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold ${
                  r.status === "منشور"
                    ? "bg-forest-50 text-forest-600"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {r.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-ink-soft">{r.text}</p>
            <div className="mt-3 flex gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-forest-50 px-3 py-1.5 text-xs font-bold text-forest-600">
                <Check className="h-3.5 w-3.5" /> اعتماد
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500">
                <Trash2 className="h-3.5 w-3.5" /> حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
