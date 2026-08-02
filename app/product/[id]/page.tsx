import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ShieldCheck, Truck, RefreshCw, ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductImage } from "@/components/ProductImage";
import { ProductCard } from "@/components/ProductCard";
import { AddToCartButton } from "@/components/AddToCartButton";
import { WishlistButton } from "@/components/WishlistButton";
import { Footer } from "@/components/Footer";
import { getProductById, getProductsByCategory } from "@/lib/products";
import { categoryNameBySlug } from "@/data/jewelleryData";
import { formatPrice } from "@/lib/currency";

export const dynamic = "force-dynamic";

const iconByCategory: Record<string, string> = {
  necklaces: "necklace",
  earrings: "earring",
  rings: "ring",
  bracelets: "bracelet",
  pendants: "pendant",
};

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = await getProductById(params.id);
  if (!product) return { title: "المنتج غير موجود" };
  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);
  if (!product) notFound();

  const related = (await getProductsByCategory(product.category))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <AppShell>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 px-5 pt-4 text-xs text-ink-muted">
        <Link href="/shop" className="hover:text-clay-500">
          المتجر
        </Link>
        <ChevronLeft className="h-3.5 w-3.5" />
        <Link
          href={`/shop?category=${product.category}`}
          className="hover:text-clay-500"
        >
          {categoryNameBySlug[product.category]}
        </Link>
      </nav>

      {/* Gallery */}
      <section className="px-5 pt-3" data-reveal>
        <div className="relative">
          <ProductImage
            src={product.image}
            surface={product.surface}
            icon={iconByCategory[product.category] ?? "gem"}
            ratio="portrait"
            rounded="rounded-3xl"
            label={product.name}
            priority
            sizes="(max-width: 480px) 100vw, 440px"
          />
          <div className="absolute end-3 top-3">
            <WishlistButton productId={product.id} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[product.image, "/images/gemstones.jpg", product.image, "/images/pendant.jpg"].map(
            (imgSrc, i) => (
              <ProductImage
                key={i}
                src={imgSrc}
                surface={i % 2 ? "cream" : product.surface}
                icon={iconByCategory[product.category] ?? "gem"}
                ratio="square"
                rounded="rounded-xl"
                label={product.name}
                sizes="25vw"
              />
            ),
          )}
        </div>
      </section>

      {/* Info */}
      <section className="px-5 pt-5" data-reveal>
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-arabic text-2xl font-extrabold leading-tight text-ink">
            {product.name}
          </h1>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="flex gap-0.5" aria-label={`${product.rating} من 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(product.rating ?? 0)
                    ? "text-gold-400"
                    : "text-cream-300"
                }`}
                fill="currentColor"
              />
            ))}
          </span>
          <span className="text-xs text-ink-muted">
            {product.rating?.toFixed(1)} ({product.reviews} تقييم)
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-3">
          <span className="price text-3xl">{formatPrice(product.price)}</span>
          {product.compareAt && (
            <span className="text-base text-ink-faint line-through">
              {formatPrice(product.compareAt)}
            </span>
          )}
        </div>

        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {product.description}
        </p>

        {product.tags && (
          <div className="mt-3 flex flex-wrap gap-2">
            {product.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-cream-200 px-3 py-1 text-xs font-semibold text-ink-soft"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <AddToCartButton productId={product.id} className="flex-1" />
          <WishlistButton
            productId={product.id}
            className="h-[3.1rem] w-[3.1rem] rounded-2xl border border-cream-300 bg-cream-50 shadow-card-soft"
          />
        </div>

        {/* Trust row */}
        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-cream-50 p-3 shadow-card-soft">
          {[
            { icon: ShieldCheck, label: "ضمان أصلي" },
            { icon: Truck, label: "شحن آمن" },
            { icon: RefreshCw, label: "إرجاع سهل" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-1 text-center">
              <f.icon className="h-5 w-5 text-gold-500" />
              <span className="text-[0.66rem] font-semibold text-ink-soft">
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="px-5 py-6">
          <h2 className="section-title mb-3">قد يعجبكِ أيضًا</h2>
          <div className="grid grid-cols-2 gap-3.5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </AppShell>
  );
}
