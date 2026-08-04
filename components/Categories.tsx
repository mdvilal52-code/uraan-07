import Link from "next/link";
import Image from "next/image";
import { CategoryIcon } from "./icons/JewelIcons";
import { categories } from "@/data/jewelleryData";

export function Categories({ title }: { title?: string }) {
  return (
    <section className="px-5 py-4">
      {title && <h2 className="section-title mb-4">{title}</h2>}
      {/* Horizontal scroll keeps every circle at the same size no matter how
          many categories exist, so nothing overflows on narrow phones. */}
      <div
        className="no-scrollbar flex gap-3 overflow-x-auto pb-1"
        data-reveal-stagger
      >
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/shop?category=${c.slug}`}
            className="press flex w-[4.2rem] shrink-0 flex-col items-center gap-2"
          >
            <span className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-cream-50 text-gold-500 shadow-card-soft ring-inset-gold">
              {c.image ? (
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <CategoryIcon name={c.icon} className="h-8 w-8" />
              )}
            </span>
            <span className="text-center text-[0.72rem] font-bold leading-tight text-ink">
              {c.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
