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
  title = "الأكثر مبيعًا",
}: {
  title?: string;
}) {
  const items = await getBestSellers();

  return (
    <section className="py-4">
      <div className="mb-3 flex items-center justify-between px-5">
        <h2 className="section-title">{title}</h2>
        <Link href="/shop" className="view-all">
          عرض الكل
        </Link>
      </div>

      <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1" data-reveal>
        {items.map((p) => (
          <Link
            key={p.id}
            href={`/product/${p.id}`}
            className="press w-[9.5rem] shrink-0"
          >
            <ProductImage
              src={p.image}
              surface={p.surface}
              icon={iconByCategory[p.category] ?? "gem"}
              ratio="square"
              rounded="rounded-2xl"
              label={p.name}
            />
            <h3 className="mt-2 font-arabic text-sm font-bold leading-snug text-ink">
              {p.name}
            </h3>
            <span className="price text-sm">{formatPrice(p.price)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
