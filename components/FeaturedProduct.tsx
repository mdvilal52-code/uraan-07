import { Heart } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { AddToCartButton } from "./AddToCartButton";
import { featuredProduct } from "@/data/jewelleryData";
import { formatPrice } from "@/lib/currency";

export function FeaturedProduct() {
  return (
    <section className="px-5 py-4">
      <div
        className="relative overflow-hidden rounded-3xl bg-forest-gradient p-5 text-cream-50 shadow-card"
        data-reveal
      >
        <div className="flex items-start justify-between">
          <span className="rounded-full bg-forest-600/70 px-3 py-1 text-[0.68rem] font-bold text-gold-200">
            منتج مميّز
          </span>
          <button
            aria-label="إضافة إلى المفضّلة"
            className="grid h-9 w-9 place-items-center rounded-full bg-forest-600/60 text-cream-100 transition hover:text-clay-400"
          >
            <Heart className="h-[1.1rem] w-[1.1rem]" />
          </button>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <div className="flex-1">
            <h2 className="font-arabic text-[1.55rem] font-extrabold leading-tight text-cream-50">
              {featuredProduct.name}
            </h2>
            <p className="mt-2 max-w-[13rem] text-[0.82rem] leading-relaxed text-cream-200/85">
              {featuredProduct.description}
            </p>
          </div>
          <div className="w-[38%] shrink-0">
            <ProductImage
              src={featuredProduct.image}
              surface="dark"
              icon="pendant"
              ratio="square"
              rounded="rounded-2xl"
              className="shadow-card"
              label={featuredProduct.name}
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="font-arabic text-2xl font-extrabold text-gold-200">
            {formatPrice(featuredProduct.price)}
          </span>
          <AddToCartButton
            productId={featuredProduct.id}
            variant="gold"
            className="flex-1 max-w-[60%]"
          />
        </div>
      </div>
    </section>
  );
}
