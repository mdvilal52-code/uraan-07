import { categories, categoryNameBySlug } from "@/data/jewelleryData";
import { listProducts, getProduct } from "@/lib/db";
import type { CategorySlug, Product } from "@/types";

/* Async read helpers over the Prisma-backed store (lib/db). */

export function getAllProducts(): Promise<Product[]> {
  return listProducts();
}

export function getProductById(id: string): Promise<Product | undefined> {
  return getProduct(id);
}

export function getProductsByCategory(
  category: CategorySlug,
): Promise<Product[]> {
  return listProducts({ category });
}

export function getBestSellers(limit?: number): Promise<Product[]> {
  return listProducts({ bestSeller: true, limit });
}

export function getNewArrivals(limit?: number): Promise<Product[]> {
  return listProducts({ newArrival: true, limit });
}

export function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) return Promise.resolve([]);
  return listProducts({ q: query });
}

/** Group products by category, preserving the categories display order. */
export async function getProductsGroupedByCategory(): Promise<
  { slug: CategorySlug; title: string; products: Product[] }[]
> {
  const all = await listProducts();
  return categories.map((c) => ({
    slug: c.slug,
    title: categoryNameBySlug[c.slug] ?? c.name,
    products: all.filter((p) => p.category === c.slug),
  }));
}
