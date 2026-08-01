import { Plus, Pencil, Trash2 } from "lucide-react";
import { Topbar } from "@/components/admin/Topbar";
import { CategoryIcon } from "@/components/icons/JewelIcons";
import { categories } from "@/data/jewelleryData";
import { getProductsByCategory } from "@/lib/products";

export default function AdminCategoriesPage() {
  return (
    <>
      <Topbar title="الفئات" />
      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-muted">تنظيم فئات المتجر</p>
          <button className="btn-forest">
            <Plus className="h-4 w-4" />
            فئة جديدة
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.slug} className="card flex items-center gap-3 p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cream-100 text-gold-500 ring-inset-gold">
                <CategoryIcon name={c.icon} className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <p className="font-arabic font-bold text-ink">{c.name}</p>
                <p className="text-xs text-ink-muted">
                  {getProductsByCategory(c.slug).length} منتج
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  aria-label="تعديل"
                  className="grid h-8 w-8 place-items-center rounded-lg bg-cream-100 text-ink-soft transition hover:bg-cream-200"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  aria-label="حذف"
                  className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                >
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
