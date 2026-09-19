import type { Metadata } from "next";
import { Gem, Award, Heart, Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductImage } from "@/components/ProductImage";
import { About as TrustBadges } from "@/components/About";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/data/jewelleryData";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The Ariana story — a legacy of craftsmanship and passion for fine gemstones and Arabic gold jewellery.",
};

const values = [
  { icon: Gem, title: "Authentic Craftsmanship", text: "Every piece is handcrafted with the utmost care." },
  { icon: Award, title: "Certified Quality", text: "Internationally certified materials and gemstones." },
  { icon: Heart, title: "A Passion for Detail", text: "We care about every fine detail, for you." },
];

export default function AboutPage() {
  return (
    <AppShell>
      <section className="px-5 pb-2 pt-5" data-reveal>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-cream-200 px-3 py-1 text-xs font-bold text-gold-600">
          <Sparkles className="h-3.5 w-3.5" /> Our Story
        </span>
        <h1 className="mt-3 font-sans text-[1.9rem] font-extrabold leading-tight text-ink text-balance">
          The Art of Timeless Moments
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          At {BRAND.name}, we believe jewellery is more than adornment — it&apos;s a
          story told and a memory that lasts. Since our founding, we have crafted
          luxurious pieces that blend authentic Arabic heritage with a
          contemporary touch, using the finest gemstones and purest gold.
        </p>

        <div className="mt-4 overflow-hidden rounded-2xl bg-gold-gradient shadow-gold lg:max-w-md">
          <ProductImage
            src="/images/arabic-gold-bar.jpg"
            ratio="landscape"
            rounded="rounded-none"
            label="Certified Arabic Gold"
          />
          <div className="px-4 py-4">
            <p className="font-sans text-sm font-extrabold text-forest-800">
              Only Authentic Arabic Gold
            </p>
            <p className="text-xs leading-snug text-forest-700">
              Every piece we sell is crafted exclusively with genuine Arabic
              gold — no other gold origin, ever.
            </p>
          </div>
        </div>
      </section>

      <section className="px-5 py-4" data-reveal>
        <ProductImage
          src="/images/editorial.jpg"
          surface="gold"
          icon="gem"
          ratio="wide"
          rounded="rounded-3xl"
          label="The Ariana Workshop"
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
                <h3 className="font-sans text-base font-bold text-ink">
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
            { v: "+15", l: "Years of Experience" },
            { v: "+5K", l: "Happy Customers" },
            { v: "+500", l: "Unique Designs" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-forest-gradient px-2 py-4 text-cream-50">
              <p className="font-sans text-2xl font-extrabold text-gold-200">
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
