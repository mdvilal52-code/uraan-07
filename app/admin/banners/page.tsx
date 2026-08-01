import { Topbar } from "@/components/admin/Topbar";
import { BannerForm } from "@/components/admin/BannerForm";
import { ProductImage } from "@/components/ProductImage";
import { Pencil, Trash2 } from "lucide-react";

const existing = [
  { id: "b1", title: "تألّقي للأبد", status: "نشط", surface: "gold" as const },
  { id: "b2", title: "مجموعة الزفاف", status: "مجدول", surface: "dark" as const },
];

export default function AdminBannersPage() {
  return (
    <>
      <Topbar title="البانرات" />
      <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-arabic text-base font-bold text-ink">
            البانرات الحالية
          </h3>
          {existing.map((b) => (
            <div key={b.id} className="card flex items-center gap-3 p-3">
              <ProductImage
                surface={b.surface}
                icon="gem"
                ratio="landscape"
                rounded="rounded-xl"
                className="h-16 w-24 shrink-0"
                label={b.title}
              />
              <div className="flex-1">
                <p className="font-arabic font-bold text-ink">{b.title}</p>
                <span className="text-xs text-forest-500">{b.status}</span>
              </div>
              <div className="flex gap-1.5">
                <button aria-label="تعديل" className="grid h-8 w-8 place-items-center rounded-lg bg-cream-100 text-ink-soft transition hover:bg-cream-200">
                  <Pencil className="h-4 w-4" />
                </button>
                <button aria-label="حذف" className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h3 className="mb-4 font-arabic text-base font-bold text-ink">
            إضافة بانر جديد
          </h3>
          <BannerForm />
        </div>
      </div>
    </>
  );
}
