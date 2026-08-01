import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductImage } from "@/components/ProductImage";
import { Footer } from "@/components/Footer";
import { collections } from "@/data/jewelleryData";
import { formatPrice } from "@/lib/currency";

export const metadata: Metadata = {
  title: "المجموعات",
  description:
    "مجموعات الأحجار الكريمة والمجوهرات، مختارة بعناية لكل مناسبة — التراث الملكي، خيار العروس، أناقة الألماس والمزيد.",
};

const icons = ["necklace", "necklace", "pendant", "ring", "earring"];

export default function CollectionsPage() {
  return (
    <AppShell>
      <header className="px-5 pb-2 pt-5" data-reveal>
        <h1 className="font-arabic text-[1.7rem] font-extrabold leading-tight text-ink text-balance">
          مجموعات الأحجار الكريمة والمجوهرات
        </h1>
        <p className="section-sub mt-1">مختارة بعناية لكل مناسبة.</p>
      </header>

      <div className="space-y-3.5 px-5 py-3" data-reveal-stagger>
        {collections.map((c, i) => (
          <article
            key={c.id}
            className="card flex items-stretch gap-3 p-3"
          >
            <div className="flex flex-1 flex-col justify-center py-1 ps-1">
              <h2 className="font-arabic text-[1.15rem] font-bold leading-snug text-ink">
                {c.name}
              </h2>
              <p className="mt-1 text-[0.82rem] leading-relaxed text-ink-muted">
                {c.description}
              </p>
              <span className="price mt-2 text-lg">{formatPrice(c.price)}</span>
              <Link
                href={`/shop`}
                className="btn-ghost-gold mt-2 self-start"
              >
                <ArrowLeft className="h-4 w-4" />
                تسوّق الآن
              </Link>
            </div>

            <div className="w-[38%] shrink-0">
              <ProductImage
                surface={c.surface}
                icon={icons[i] ?? "gem"}
                ratio="square"
                rounded="rounded-2xl"
                label={c.name}
              />
            </div>
          </article>
        ))}
      </div>

      <Footer />
    </AppShell>
  );
}
