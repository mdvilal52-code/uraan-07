import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ShieldCheck, Truck, RefreshCw, ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductImage } from "@/components/ProductImage";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductActions } from "@/components/product/ProductActions";
import { ProductWeightInfo } from "@/components/product/ProductWeightInfo";
import { Footer } from "@/components/Footer";
import { getProductById, getProductsByCategory } from "@/lib/products";
import {
  categoryNameBySlug,
  products as catalogProducts,
} from "@/data/jewelleryData";
import { formatPrice } from "@/lib/currency";

// Product pages carry no per-request or per-user data — everyone viewing a
// given product sees the same catalogue-driven content (the cart/wishlist
// actions are client components with their own state). `force-dynamic` meant a
// DB round-trip on *every* view with no caching, which is slow on cold
// serverless instances. ISR renders each product once, caches it, and
// refreshes in the background so pages load instantly while admin edits still
// appear within the revalidation window. The DB→catalogue fallback in lib/db
// keeps rendering safe even when the database is unreachable.
export const revalidate = 60;
export const dynamicParams = true;

// Pre-render every built-in catalogue product at build time so their pages
// load instantly (no cold-start DB round-trip on first view). This is
// build-safe: at build time lib/db serves the static catalogue without ever
// opening a database connection. Products added later via the admin panel
// aren't in this list but still render on demand (dynamicParams) and are then
// cached by ISR.
export function generateStaticParams() {
  return catalogProducts.map((p) => ({ id: p.id }));
}

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

  const relatedImages = related
    .filter((p) => p.image)
    .map((p) => p.image)
    .slice(0, 3);
  const galleryImages = [product.image, ...relatedImages];

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

      {/* Gallery with thumbnails */}
      <ProductGallery images={galleryImages} name={product.name} />

      {/* Info */}
      <section className="px-5 pt-5" data-reveal>
        <h1 className="font-arabic text-2xl font-extrabold leading-tight text-ink">
          {product.name}
        </h1>

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

        {/* Gold weight & karat — admin-controlled, N/A when unset */}
        <ProductWeightInfo
          karats={product.karats}
          goldWeight={product.goldWeight}
          totalWeight={product.totalWeight}
        />

        {/* Buy + Add to Cart + Wishlist */}
        <ProductActions productId={product.id} />

        {/* Trust row */}
        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-cream-50 p-3 shadow-card-soft">
          {[
            { icon: RefreshCw, label: "إرجاع سهل" },
            { icon: Truck, label: "شحن آمن" },
            { icon: ShieldCheck, label: "ضمان أصلي" },
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
