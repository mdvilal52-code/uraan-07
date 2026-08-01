import Link from "next/link";
import { CategoryIcon } from "./icons/JewelIcons";
import { categories } from "@/data/jewelleryData";

export function Categories({ title }: { title?: string }) {
  return (
    <section className="px-5 py-4">
      {title && <h2 className="section-title mb-4">{title}</h2>}
      <div className="flex justify-between gap-1" data-reveal-stagger>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/shop?category=${c.slug}`}
            className="press flex flex-1 flex-col items-center gap-2"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-cream-50 text-gold-500 shadow-card-soft ring-inset-gold">
              <CategoryIcon name={c.icon} className="h-8 w-8" />
            </span>
            <span className="text-[0.72rem] font-bold text-ink">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
