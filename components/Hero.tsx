import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { ProductImage } from "./ProductImage";
import { listBanners } from "@/lib/db";
import type { GemSurface } from "@/types";

// Default copy shown whenever the admin hasn't published an active banner
// (Admin → Banners, status "Active") — keeps the hero populated out of the box.
const FALLBACK = {
  title: "Timeless Arabic Gold, Radiance Without End",
  subtitle: "Exquisite Arabic gold and gemstone jewellery, crafted for you.",
  buttonText: "Shop Now",
  link: "/shop",
  image: "/images/hero.jpg",
  surface: "dark" as GemSurface,
};

export async function Hero() {
  const banners = await listBanners();
  // Most recently created active banner wins — listBanners() already orders
  // by createdAt desc, so this is the newest published one.
  const active = banners.find((b) => b.status === "active");

  const title = active?.title || FALLBACK.title;
  const subtitle = active?.subtitle || FALLBACK.subtitle;
  const buttonText = active?.buttonText || FALLBACK.buttonText;
  const link = active?.link || FALLBACK.link;
  const image = active?.image || FALLBACK.image;
  const surface = (active?.surface as GemSurface) || FALLBACK.surface;

  return (
    <section className="px-4 pb-2 pt-4 lg:px-10 lg:pb-6 lg:pt-8">
      {/* Full-bleed model image fills the whole hero card; copy sits on a soft
          scrim at the bottom so the jewellery stays fully visible. The image
          itself is NOT wrapped in data-reveal: it's the page's priority LCP
          element, and data-reveal starts at opacity:0 until useScrollAnimation
          flips it client-side — that was silently delaying the actual paint
          of an image that had already loaded eagerly. The reveal fade is kept
          on the text/CTA overlay only, where a delayed entrance is intentional. */}
      <div className="relative overflow-hidden rounded-[2rem] shadow-card">
        <ProductImage
          src={image}
          surface={surface}
          icon="necklace"
          ratio="portrait"
          rounded="rounded-[2rem]"
          className="min-h-[26rem] lg:aspect-[21/9] lg:min-h-[32rem]"
          label="Gemstone necklace and earring set"
          priority
          sizes="(max-width: 1023px) 100vw, 1440px"
        />

        {/* legibility scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-900/85 via-forest-900/25 to-transparent" />

        {/* Overlaid copy */}
        <div className="absolute inset-x-0 bottom-0 p-5 lg:p-12" data-reveal>
          <h1 className="flex flex-wrap items-center gap-2 font-sans text-[1.85rem] font-extrabold leading-[1.2] text-cream-50 text-balance drop-shadow-sm lg:text-5xl">
            {title}
            <Sparkles
              className="h-5 w-5 shrink-0 text-gold-300 lg:h-8 lg:w-8"
              fill="currentColor"
              fillOpacity={0.35}
            />
          </h1>
          <p className="mt-2 max-w-[17rem] text-sm leading-relaxed text-cream-100/90 lg:mt-3 lg:max-w-sm lg:text-base">
            {subtitle}
          </p>
          <Link
            href={link}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-gold-gradient px-6 py-3.5 text-sm font-extrabold text-forest-800 shadow-gold transition active:scale-[0.98] lg:mt-6 lg:px-8 lg:py-4 lg:text-base"
          >
            {buttonText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
