import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";
import { ProductImage } from "./ProductImage";

/* Faint woven-fabric backdrop, shared by both the text and the photo so the
   whole hero reads as one textured surface rather than a flat panel. */
const weaveTexture = {
  backgroundImage:
    "repeating-linear-gradient(45deg, rgba(124,106,77,0.5) 0, rgba(124,106,77,0.5) 1px, transparent 1px, transparent 9px), repeating-linear-gradient(-45deg, rgba(124,106,77,0.5) 0, rgba(124,106,77,0.5) 1px, transparent 1px, transparent 9px)",
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream-radial px-5 pb-7 pt-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={weaveTexture}
      />

      <div className="relative flex items-start gap-3">
        <div className="relative z-10 flex-1 pt-2" data-reveal>
          <h1 className="font-arabic text-[1.7rem] font-extrabold leading-[1.2] text-ink text-balance">
            تألّقي للأبد،
            <span className="mt-1 flex items-center gap-1.5">
              بريقٌ لا ينتهي
              <Sparkles className="h-5 w-5 shrink-0 text-gold-400" fill="currentColor" fillOpacity={0.25} />
            </span>
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            أحجار كريمة ومجوهرات راقية، مصنوعة من أجلكِ.
          </p>
          <Link href="/shop" className="btn-forest mt-5">
            تسوّقي الآن
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative -my-2 w-[42%] shrink-0" data-reveal>
          <div className="absolute inset-6 rounded-full bg-gold-200/50 blur-2xl" />
          <ProductImage
            src="/images/hero-pendant.jpg"
            surface="cream"
            icon="necklace"
            ratio="portrait"
            rounded="rounded-[2rem]"
            className="relative animate-float [mask-image:radial-gradient(ellipse_75%_75%_at_50%_42%,black_58%,transparent_100%)] [-webkit-mask-image:radial-gradient(ellipse_75%_75%_at_50%_42%,black_58%,transparent_100%)]"
            label="قلادة قلب الزمرد"
            priority
            sizes="45vw"
          />
        </div>
      </div>
    </section>
  );
}
