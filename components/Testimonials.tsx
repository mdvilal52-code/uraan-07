import { Star, Quote } from "lucide-react";
import { testimonials } from "@/data/jewelleryData";

export function Testimonials({
  title = "آراء عميلاتنا",
}: {
  title?: string;
}) {
  return (
    <section className="py-4">
      <h2 className="section-title mb-3 px-5">{title}</h2>
      <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 pb-1" data-reveal>
        {testimonials.map((t) => (
          <figure
            key={t.id}
            className="card w-[16rem] shrink-0 p-4"
          >
            <Quote className="h-6 w-6 text-gold-300" fill="currentColor" fillOpacity={0.2} />
            <blockquote className="mt-2 font-arabic text-sm leading-relaxed text-ink-soft">
              {t.text}
            </blockquote>
            <figcaption className="mt-3 flex items-center justify-between">
              <span className="font-arabic text-sm font-bold text-ink">{t.name}</span>
              <span className="flex gap-0.5" aria-label={`${t.rating} من 5`}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 text-gold-400" fill="currentColor" />
                ))}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
