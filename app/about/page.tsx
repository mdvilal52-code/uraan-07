import type { Metadata } from "next";
import { Gem, Award, Heart, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductImage } from "@/components/ProductImage";
import { About as TrustBadges } from "@/components/About";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/data/jewelleryData";

export const metadata: Metadata = {
  title: "من نحن",
  description:
    "قصّة أريانا — إرثٌ من الحِرفية والشغف في صناعة الأحجار الكريمة والمجوهرات الفاخرة.",
};

const values = [
  { icon: Gem, title: "حِرفية أصيلة", text: "كل قطعة تُصنع يدويًا بعناية فائقة." },
  { icon: Award, title: "جودة معتمدة", text: "خامات وأحجار معتمدة عالميًا." },
  { icon: Heart, title: "شغفٌ بالتفاصيل", text: "نهتمّ بأدقّ التفاصيل من أجلكِ." },
];

export default function AboutPage() {
  return (
    <AppShell>
      <section className="px-5 pb-2 pt-5" data-reveal>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-200 px-3 py-1 text-xs font-bold text-gold-600">
          <Sparkles className="h-3.5 w-3.5" /> قصّتنا
        </span>
        <h1 className="mt-3 font-arabic text-[1.9rem] font-extrabold leading-tight text-ink text-balance">
          فنّ يُخلّد اللحظات الثمينة
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          في {BRAND.name}، نؤمن بأن المجوهرات ليست مجرّد زينة، بل قصصٌ تُروى
          وذكرياتٌ تدوم. منذ انطلاقتنا ونحن نصنع قطعًا فاخرة تجمع بين أصالة
          التراث ولمسة العصر، بأجود الأحجار الكريمة وأنقى المعادن.
        </p>
      </section>

      <section className="px-5 py-4" data-reveal>
        <ProductImage
          src="/images/editorial.jpg"
          surface="gold"
          icon="gem"
          ratio="wide"
          rounded="rounded-3xl"
          label="ورشة أريانا"
          sizes="(max-width: 640px) 100vw, 600px"
        />
      </section>

      <section className="px-5 py-4">
        <div className="grid grid-cols-1 gap-3" data-reveal-stagger>
          {values.map((v) => (
            <div key={v.title} className="card flex items-center gap-3 p-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cream-100 text-gold-500 ring-inset-gold">
                <v.icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-arabic text-base font-bold text-ink">
                  {v.title}
                </h3>
                <p className="text-sm text-ink-muted">{v.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-4">
        <div className="grid grid-cols-3 gap-2.5 text-center" data-reveal-stagger>
          {[
            { v: "+15", l: "عامًا من الخبرة" },
            { v: "+5K", l: "عميلة سعيدة" },
            { v: "+500", l: "تصميم فريد" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-forest-gradient px-2 py-4 text-cream-50">
              <p className="font-arabic text-2xl font-extrabold text-gold-200">
                {s.v}
              </p>
              <p className="mt-1 text-[0.66rem] text-cream-200/85">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      <TrustBadges />
      <Footer />
    </AppShell>
  );
}
