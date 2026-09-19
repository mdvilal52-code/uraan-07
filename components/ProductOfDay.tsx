import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { productOfDay } from "@/data/jewelleryData";
import { formatPrice } from "@/lib/currency";

export function ProductOfDay() {
  return (
    <section className="px-5 pb-2 pt-4 lg:px-10">
      <div className="card flex items-stretch gap-3 p-3" data-reveal>
        <div className="flex flex-1 flex-col py-1 ps-1 lg:py-3 lg:ps-2">
          <span className="text-[0.72rem] font-bold uppercase tracking-wider text-gold-600 lg:text-base">
            Jewellery of the Day
          </span>
          <h2 className="mt-0.5 font-sans text-[1.15rem] font-bold leading-snug text-ink lg:mt-2 lg:text-3xl">
            {productOfDay.name}
          </h2>
          <span className="price mt-1 text-lg lg:mt-2 lg:text-3xl">{formatPrice(productOfDay.price)}</span>
          <p className="mt-1 text-[0.82rem] leading-relaxed text-ink-muted lg:mt-2 lg:text-lg">
            Beauty in every sparkle.
          </p>
          <Link
            href={`/product/${productOfDay.id}`}
            className="btn-ghost-gold mt-3 lg:mt-4 lg:text-lg"
          >
            <ArrowRight className="h-4 w-4" />
            View Details
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
