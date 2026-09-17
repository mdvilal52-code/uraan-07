import { Topbar } from "@/components/admin/Topbar";
import { CategoryIcon } from "@/components/icons/JewelIcons";
import { categories } from "@/data/jewelleryData";
import { getAllProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

// Categories are a fixed part of the catalogue structure (data/jewelleryData.ts),
// not a database table — this page is a read-only overview of what's
// configured and how many products are in each, not a CRUD screen.
export default async function AdminCategoriesPage() {
  const all = await getAllProducts();
  const countBy = (slug: string) =>
    all.filter((p) => p.category === slug).length;

  return (
    <>
      <Topbar title="Categories" />
      <div className="space-y-5 p-4 sm:p-6">
        <p className="text-sm text-ink-muted">
          Store categories and how many products are in each.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <div key={c.slug} className="card flex items-center gap-3 p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cream-100 text-gold-500 ring-inset-gold">
                <CategoryIcon name={c.icon} className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <p className="font-sans font-bold text-ink">{c.name}</p>
                <p className="text-xs text-ink-muted">
                  {countBy(c.slug)} product{countBy(c.slug) === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
