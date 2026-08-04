import { AppShell } from "@/components/AppShell";
import { Hero } from "@/components/Hero";
import { ProductOfDay } from "@/components/ProductOfDay";
import { QuickActions } from "@/components/QuickActions";
import { FeaturedProduct } from "@/components/FeaturedProduct";
import { Bestseller } from "@/components/Bestseller";
import { Categories } from "@/components/Categories";
import { About } from "@/components/About";
import { Testimonials } from "@/components/Testimonials";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";

// The home page has no per-request or per-user data — every visitor sees the
// same catalogue-driven sections. Rendering it with `force-dynamic` meant Next
// could never cache its RSC payload, so *every* client navigation back to Home
// (e.g. Home → … → Home) had to re-fetch the payload from the server on demand.
// On a cold/slow serverless instance that on-demand fetch can fail, which the
// App Router surfaces as a console error ("Failed to fetch RSC payload …
// Falling back to browser navigation"). ISR makes the payload prefetchable and
// cache-served, so returning to Home is instant and never triggers that fetch,
// while `revalidate` keeps the best-seller data fresh. The DB→catalogue
// fallback in lib/db keeps the build-time render safe even without a database.
export const revalidate = 60;

export default function HomePage() {
  return (
    <AppShell>
      <Hero />
      <ProductOfDay />
      <QuickActions />
      <FeaturedProduct />
      <Bestseller />
      <Categories title="تسوّق حسب الفئة" />
      <About />
      <Testimonials />
      <Newsletter />
      <Footer />
    </AppShell>
  );
}
