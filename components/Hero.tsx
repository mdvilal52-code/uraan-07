import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { ProductImage } from "./ProductImage";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream-radial px-5 pb-6 pt-6">
      <div className="relative flex items-start gap-3">
        <div className="relative z-10 flex-1 pt-2" data-reveal>
          <h1 className="font-arabic text-[2.05rem] font-extrabold leading-[1.15] text-ink text-balance">
            تألّقي للأبد،
            <span className="mt-1 flex items-center gap-2">
              بريقٌ لا ينتهي
              <Sparkles className="h-6 w-6 text-gold-400" fill="currentColor" fillOpacity={0.25} />
            </span>
          </h1>
          <p className="mt-3 max-w-[15rem] text-sm leading-relaxed text-ink-muted">
            أحجار كريمة ومجوهرات راقية، مصنوعة من أجلكِ.
          </p>
          <Link href="/shop" className="btn-forest mt-5">
            تسوّقي الآن
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative w-[38%] shrink-0" data-reveal>
          <ProductImage
            surface="cream"
            icon="necklace"
            ratio="portrait"
            rounded="rounded-[1.75rem]"
            className="shadow-card animate-float"
            label="قلادة ذهبية فاخرة"
          />
          <span className="absolute -bottom-2 -start-2 grid h-11 w-11 place-items-center rounded-full bg-gold-gradient text-forest-800 shadow-gold">
            <Sparkles className="h-5 w-5" />
          </span>
        </div>
      </div>
    </section>
  );
}
