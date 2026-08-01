import { categories, categoryNameBySlug } from "@/data/jewelleryData";
import { listProducts, getProduct } from "@/lib/db";
import type { CategorySlug, Product } from "@/types";

/* Thin read helpers over the runtime store (lib/db). */

export function getAllProducts(): Product[] {
  return listProducts();
}

export function getProductById(id: string): Product | undefined {
  return getProduct(id);
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  return listProducts({ category });
}

export function getBestSellers(limit?: number): Product[] {
  return listProducts({ bestSeller: true, limit });
}

export function getNewArrivals(limit?: number): Product[] {
  return listProducts({ newArrival: true, limit });
}

export function searchProducts(query: string): Product[] {
  if (!query.trim()) return [];
  return listProducts({ q: query });
}

/** Group products by category, preserving the categories display order. */
export function getProductsGroupedByCategory(): {
  slug: CategorySlug;
  title: string;
  products: Product[];
}[] {
  return categories.map((c) => ({
    slug: c.slug,
    title: categoryNameBySlug[c.slug] ?? c.name,
    products: getProductsByCategory(c.slug),
  }));
}

/** Static params for the product detail route (seed snapshot). */
export function getProductIds(): string[] {
  return listProducts().map((p) => p.id);
}
