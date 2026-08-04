import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { ProductImage } from "./ProductImage";

export function Hero() {
  return (
    <section className="px-4 pb-2 pt-4">
      {/* Full-bleed model image fills the whole hero card; copy sits on a soft
          scrim at the bottom so the jewellery stays fully visible. */}
      <div className="relative overflow-hidden rounded-[2rem] shadow-card" data-reveal>
        <ProductImage
          src="/images/hero.jpg"
          surface="dark"
          icon="necklace"
          ratio="portrait"
          rounded="rounded-[2rem]"
          className="min-h-[26rem]"
          label="طقم قلادة وأقراط من الأحجار الكريمة"
          priority
          sizes="(max-width: 480px) 100vw, 480px"
        />

        {/* legibility scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-900/85 via-forest-900/25 to-transparent" />

        {/* Overlaid copy */}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h1 className="font-arabic text-[1.85rem] font-extrabold leading-[1.2] text-cream-50 text-balance drop-shadow-sm">
            تألّقي للأبد،
            <span className="mt-1 flex items-center gap-1.5">
              بريقٌ لا ينتهي
              <Sparkles
                className="h-5 w-5 shrink-0 text-gold-300"
                fill="currentColor"
                fillOpacity={0.35}
              />
            </span>
          </h1>
          <p className="mt-2 max-w-[17rem] text-sm leading-relaxed text-cream-100/90">
            أحجار كريمة ومجوهرات راقية، مصنوعة من أجلكِ.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-gold-gradient px-6 py-3.5 text-sm font-extrabold text-forest-800 shadow-gold transition active:scale-[0.98]"
          >
            تسوّقي الآن
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
