import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { productOfDay } from "@/data/jewelleryData";
import { formatPrice } from "@/lib/currency";

export function ProductOfDay() {
  return (
    <section className="px-5 pb-2 pt-4">
      <div className="card flex items-stretch gap-3 p-3" data-reveal>
        <div className="flex flex-1 flex-col py-1 ps-1">
          <span className="text-[0.72rem] font-bold uppercase tracking-wider text-gold-600">
            مجوهرات اليوم
          </span>
          <h2 className="mt-0.5 font-arabic text-[1.15rem] font-bold leading-snug text-ink">
            {productOfDay.name}
          </h2>
          <span className="price mt-1 text-lg">{formatPrice(productOfDay.price)}</span>
          <p className="mt-1 text-[0.82rem] leading-relaxed text-ink-muted">
            جمالٌ في كل بريق.
          </p>
          <Link
            href={`/product/${productOfDay.id}`}
            className="btn-ghost-gold mt-3"
          >
            <ArrowLeft className="h-4 w-4" />
            عرض التفاصيل
          </Link>
        </div>

        <div className="w-[42%] shrink-0">
          <ProductImage
            src={productOfDay.image}
            surface={productOfDay.surface}
            icon="pendant"
            ratio="square"
            rounded="rounded-2xl"
            label={productOfDay.name}
          />
        </div>
      </div>
    </section>
  );
}
