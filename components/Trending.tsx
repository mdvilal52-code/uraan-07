import Link from "next/link";
import { ProductImage } from "./ProductImage";
import { trendingCollections } from "@/data/jewelleryData";
import { formatPrice } from "@/lib/currency";

const icons = ["necklace", "ring", "earring"];

export function Trending({
  title = "المجموعات الرائجة",
}: {
  title?: string;
}) {
  return (
    <section className="py-4">
      <div className="mb-3 flex items-center justify-between px-5">
        <h2 className="section-title">{title}</h2>
        <Link href="/collections" className="view-all">
          عرض الكل
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2.5 px-5" data-reveal-stagger>
        {trendingCollections.map((c, i) => (
          <Link key={c.id} href="/collections" className="press">
            <ProductImage
              surface="dark"
              icon={icons[i] ?? "gem"}
              ratio="square"
              rounded="rounded-2xl"
              label={c.name}
            />
            <h3 className="mt-2 text-center font-arabic text-[0.82rem] font-bold leading-tight text-ink">
              {c.name}
            </h3>
            <span className="price block text-center text-[0.82rem]">
              {formatPrice(c.price)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
