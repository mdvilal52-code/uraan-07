import { products, categories, categoryNameBySlug } from "@/data/jewelleryData";
import type { CategorySlug, Product } from "@/types";

export function getAllProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  return products.filter((p) => p.category === category);
}

export function getBestSellers(limit?: number): Product[] {
  const list = products.filter((p) => p.bestSeller);
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export function getNewArrivals(limit?: number): Product[] {
  const list = products.filter((p) => p.newArrival);
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.latin.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.tags ?? []).some((t) => t.toLowerCase().includes(q)),
  );
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

/** Static params for the product detail route. */
export function getProductIds(): string[] {
  return products.map((p) => p.id);
}
