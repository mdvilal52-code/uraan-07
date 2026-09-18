import Link from "next/link";
import { ProductImage } from "./ProductImage";
import { getBestSellers } from "@/lib/products";
import { formatPrice } from "@/lib/currency";

const iconByCategory: Record<string, string> = {
  necklaces: "necklace",
  earrings: "earring",
  rings: "ring",
  bracelets: "bracelet",
  pendants: "pendant",
};

export async function Bestseller({
  title = "Best Sellers",
}: {
  title?: string;
}) {
  const items = await getBestSellers();

  return (
    <section className="py-4">
      <div className="mb-3 flex items-center justify-between px-5 lg:px-10">
        <h2 className="section-title">{title}</h2>
        <Link href="/shop" className="view-all">
          View All
        </Link>
      </div>

      {/* Horizontal-scroll strip on mobile (each card a fixed width); at lg:+
          there's room to lay every card out as a real grid instead of making
          desktop visitors scroll sideways through a cramped huddle of items. */}
      <div
        className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-10"
        data-reveal
      >
        {items.map((p, i) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="press w-[9.5rem] shrink-0 lg:w-full"
          >
            <ProductImage
              src={p.image}
              surface={p.surface}
              icon={iconByCategory[p.category] ?? "gem"}
              ratio="square"
              rounded="rounded-2xl"
              label={p.name}
              priority={i < 4}
            />
            <h3 className="mt-2 font-sans text-sm font-bold leading-snug text-ink">
              {p.name}
            </h3>
            <span className="price text-sm">{formatPrice(p.price)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
