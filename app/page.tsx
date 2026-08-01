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

export const dynamic = "force-dynamic";

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
