import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Play, CalendarDays } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Categories } from "@/components/Categories";
import { Trending } from "@/components/Trending";
import { ProductImage } from "@/components/ProductImage";
import { Footer } from "@/components/Footer";
import {
  gemstoneFeature,
  editorialFeature,
  exhibitions,
} from "@/data/jewelleryData";
import { formatPrice } from "@/lib/currency";

export const metadata: Metadata = {
  title: "استكشف",
  description:
    "اكتشف عالمًا من أجود الأحجار الكريمة والمجوهرات — المجموعات الرائجة والأحجار الكريمة والمعارض القادمة.",
};

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-3 flex items-center justify-between px-5">
      <h2 className="section-title">{title}</h2>
      <Link href={href} className="view-all">
        عرض الكل
      </Link>
    </div>
  );
}

export default function ExplorePage() {
  const ex = exhibitions[0];

  return (
    <AppShell>
      {/* Page intro */}
      <header className="px-5 pb-1 pt-5" data-reveal>
        <h1 className="font-arabic text-[1.7rem] font-extrabold text-ink">
          استكشف
        </h1>
        <p className="section-sub mt-1 max-w-xs">
          اكتشف عالمًا من أجود الأحجار الكريمة والمجوهرات
        </p>
      </header>

      {/* Category circles */}
      <Categories />

      {/* Trending collections */}
      <Trending />

      {/* Gemstone feature */}
      <section className="py-4">
        <SectionHeader title="مجموعة الأحجار الكريمة" href="/shop" />
        <div className="px-5" data-reveal>
          <div className="card flex items-stretch gap-3 p-3">
            <div className="w-[40%] shrink-0">
              <ProductImage
                surface="gold"
                icon="gem"
                ratio="square"
                rounded="rounded-2xl"
                label={gemstoneFeature.title}
                shimmer
              />
            </div>
            <div className="flex flex-1 flex-col py-1">
              <h3 className="font-arabic text-[1.1rem] font-bold text-ink">
                {gemstoneFeature.title}
              </h3>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-ink-muted">
                {gemstoneFeature.description}
              </p>
              <span className="price mt-2 text-base">
                {formatPrice(gemstoneFeature.price)}
              </span>
              <Link href="/shop" className="btn-ghost-gold mt-2">
                <ArrowLeft className="h-4 w-4" />
                تسوّق الآن
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial / jewellery knowledge */}
      <section className="py-4">
        <SectionHeader title="معلومات عن المجوهرات" href="/about" />
        <div className="px-5" data-reveal>
          <div className="card flex items-stretch gap-3 p-3">
            <div className="relative w-[40%] shrink-0">
              <ProductImage
                surface="dark"
                icon="necklace"
                ratio="square"
                rounded="rounded-2xl"
                label={editorialFeature.title}
              />
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-cream-50/90 text-forest-700 shadow-card">
                  <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />
                </span>
              </span>
            </div>
            <div className="flex flex-1 flex-col py-1">
              <h3 className="font-arabic text-[1.1rem] font-bold text-ink">
                {editorialFeature.title}
              </h3>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-ink-muted">
                {editorialFeature.description}
              </p>
              <Link href="/about" className="btn-ghost-gold mt-2">
                <ArrowLeft className="h-4 w-4" />
                {editorialFeature.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming exhibitions */}
      <section className="py-4">
        <SectionHeader title="المعارض القادمة" href="/contact" />
        <div className="px-5" data-reveal>
          <div className="card flex items-center gap-3 p-3">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-forest-gradient text-cream-50">
              <span className="text-[0.62rem] font-semibold text-gold-200">
                {ex.month}
              </span>
              <span className="-mt-0.5 font-arabic text-2xl font-extrabold leading-none">
                {ex.day}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-arabic text-[1.02rem] font-bold text-ink">
                {ex.title}
              </h3>
              <p className="mt-0.5 flex items-center gap-1.5 text-[0.72rem] text-ink-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                {ex.dateLabel} · {ex.timeLabel}
              </p>
              <p className="mt-0.5 text-[0.72rem] text-ink-faint">{ex.venue}</p>
            </div>
            <Link
              href="/contact"
              className="shrink-0 rounded-xl bg-forest-600 px-3.5 py-2 text-[0.72rem] font-bold text-cream-50"
            >
              احجز الآن
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </AppShell>
  );
}
