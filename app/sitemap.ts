import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

const staticRoutes = [
  "",
  "/explore",
  "/collections",
  "/shop",
  "/about",
  "/contact",
  "/search",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listProducts();

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...productEntries];
}
