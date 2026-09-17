import type {
  Category,
  Collection,
  Exhibition,
  Product,
  QuickAction,
} from "@/types";

/* ============================================================
   Central content source for Ariana Gems & Jewellery.
   An Arabic / Gulf-inspired gold jewellery storefront, written in
   natural English for an international, English-speaking customer.
   Prices are in AUD.
   ============================================================ */

export const BRAND = {
  name: "Ariana",
  tagline: "GEMS & JEWELLERY PVT",
} as const;

/** Store contact details (single source of truth for footer + contact page). */
export const CONTACT = {
  address: "27C Langhorne St, Dandenong VIC 3175, Australia",
  phoneIntl: "+61 3 9791 1331",
  phoneLocal: "(03) 9791 1331",
  phoneHref: "tel:+61397911331",
  email: "hello@ariana.example",
  hours: "Daily · 10 AM – 10 PM",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=27C+Langhorne+St+Dandenong+VIC+3175+Australia",
  social: {
    facebook: "https://www.facebook.com/share/14knXVAZFtt/",
    instagram:
      "https://www.instagram.com/ariana_gems_jewellery?igsh=dDQwbDFrMmVvazBq",
  },
} as const;

export const categories: Category[] = [
  {
    slug: "gems",
    name: "Gemstones",
    latin: "Gems",
    icon: "gem",
    image: "/images/gemstones.jpg",
  },
  {
    slug: "necklaces",
    name: "Necklaces",
    latin: "Necklaces",
    icon: "necklace",
    image: "/images/necklace.jpg",
  },
  {
    slug: "earrings",
    name: "Earrings",
    latin: "Earrings",
    icon: "earring",
    image: "/images/earrings.jpg",
  },
  {
    slug: "rings",
    name: "Rings",
    latin: "Rings",
    icon: "ring",
    image: "/images/ring.jpg",
  },
  {
    slug: "bracelets",
    name: "Bracelets",
    latin: "Bracelets",
    icon: "bracelet",
    image: "/images/bracelet.jpg",
  },
  {
    slug: "pendants",
    name: "Pendants",
    latin: "Pendants",
    icon: "pendant",
    image: "/images/pendant.jpg",
  },
];

export const categoryNameBySlug: Record<string, string> = {
  necklaces: "Necklaces",
  earrings: "Earrings",
  rings: "Rings",
  bracelets: "Bracelets",
  pendants: "Pendants",
  gems: "Gemstones",
};

export const products: Product[] = [
  // Necklaces
  {
    id: "nk-diamond-maas",
    name: "Diamond Statement Necklace",
    latin: "Diamond Statement Necklace",
    category: "necklaces",
    price: 2450,
    description:
      "A diamond-set gold necklace with a refined, classic silhouette — an elegant choice for weddings and the most special occasions.",
    surface: "gold",
    image: "/images/necklace.jpg",
    bestSeller: true,
    newArrival: true,
    rating: 4.9,
    reviews: 128,
    tags: ["Diamond", "Bridal"],
    goldWeight: 16.3,
    totalWeight: 17.8,
  },
  {
    id: "nk-polki",
    name: "Heritage Gold Necklace",
    latin: "Heritage Gold Necklace",
    category: "necklaces",
    price: 1650,
    description:
      "A gold necklace inspired by royal heritage design, reimagined with a modern touch.",
    surface: "gold",
    image: "/images/necklace-2.jpg",
    bestSeller: true,
    rating: 4.8,
    reviews: 94,
    tags: ["Heritage", "Gold"],
    goldWeight: 11.2,
    totalWeight: 12.5,
  },
  // Earrings
  {
    id: "er-maas",
    name: "Diamond Drop Earrings",
    latin: "Diamond Drop Earrings",
    category: "earrings",
    price: 760,
    description:
      "Brilliant diamond earrings that add radiant sparkle to any look.",
    surface: "cream",
    image: "/images/earrings.jpg",
    newArrival: true,
    rating: 4.9,
    reviews: 76,
    tags: ["Diamond"],
    goldWeight: 4.8,
    totalWeight: 5.2,
  },
  {
    id: "er-jhumka",
    name: "Ornate Gold Earrings",
    latin: "Ornate Gold Earrings",
    category: "earrings",
    price: 565,
    description:
      "Gold earrings with fine handcrafted detail and timeless, authentic elegance.",
    surface: "gold",
    image: "/images/earrings-2.jpg",
    rating: 4.7,
    reviews: 58,
    tags: ["Gold", "Heritage"],
    goldWeight: 6.1,
    totalWeight: 6.4,
  },
  // Rings
  {
    id: "rg-solitaire",
    name: "Solitaire Diamond Ring",
    latin: "Solitaire Diamond Ring",
    category: "rings",
    price: 1100,
    description:
      "A solitaire ring with a center diamond that captures every glance from the first moment.",
    surface: "cream",
    image: "/images/ring.jpg",
    bestSeller: true,
    rating: 5.0,
    reviews: 210,
    tags: ["Diamond", "Engagement"],
    goldWeight: 5.4,
    totalWeight: 5.9,
  },
  {
    id: "rg-gemstone",
    name: "Emerald Gemstone Ring",
    latin: "Emerald Gemstone Ring",
    category: "rings",
    price: 925,
    description:
      "A ring set with a vivid emerald gemstone, encircled by brilliant diamonds.",
    surface: "gold",
    image: "/images/ring-2.jpg",
    rating: 4.8,
    reviews: 63,
    tags: ["Emerald", "Gemstone"],
    goldWeight: 4.9,
    totalWeight: 6.1,
  },
  // Bracelets
  {
    id: "br-diamond",
    name: "Diamond Tennis Bracelet",
    latin: "Diamond Tennis Bracelet",
    category: "bracelets",
    price: 2250,
    description:
      "A slender diamond bracelet that wraps the wrist in continuous brilliance.",
    surface: "cream",
    image: "/images/bracelet.jpg",
    bestSeller: true,
    rating: 4.9,
    reviews: 88,
    tags: ["Diamond"],
    goldWeight: 14.2,
    totalWeight: 15.6,
  },
  {
    id: "br-gold",
    name: "Emerald Gold Bracelet",
    latin: "Emerald Gold Bracelet",
    category: "bracelets",
    price: 1580,
    description:
      "A gold bracelet set with emerald stones for a refined, regal look.",
    surface: "gold",
    image: "/images/bracelet-2.jpg",
    newArrival: true,
    rating: 4.7,
    reviews: 41,
    tags: ["Gold", "Emerald"],
    goldWeight: 18.5,
    totalWeight: 19.8,
  },
  // Pendants
  {
    id: "pd-heart-diamond",
    name: "Diamond Heart Pendant",
    latin: "Diamond Heart Pendant",
    category: "pendants",
    price: 3250,
    description:
      "A symbol of love, crafted in gold and set with genuine diamonds to last as an eternal keepsake.",
    surface: "dark",
    image: "/images/heart-pendant.jpg",
    bestSeller: true,
    newArrival: true,
    rating: 5.0,
    reviews: 156,
    tags: ["Diamond", "Gold", "Gift"],
    goldWeight: 6.8,
    totalWeight: 8.0,
  },
  {
    id: "pd-solitaire",
    name: "Solitaire Diamond Pendant",
    latin: "Solitaire Diamond Pendant",
    category: "pendants",
    price: 1450,
    description:
      "Beauty in every sparkle — an elegant, timeless solitaire diamond pendant.",
    surface: "cream",
    image: "/images/pendant.jpg",
    newArrival: true,
    rating: 4.9,
    reviews: 73,
    tags: ["Diamond"],
    goldWeight: 3.9,
    totalWeight: 4.6,
  },
  // Gemstones
  {
    id: "gem-emerald-suite",
    name: "Emerald Luxe Suite",
    latin: "Emerald Luxe Suite",
    category: "gems",
    price: 3850,
    description:
      "A luxurious emerald suite set with diamonds — natural gemstones in a captivating green that commands attention.",
    surface: "gold",
    image: "/images/gemstones.jpg",
    bestSeller: true,
    newArrival: true,
    rating: 5.0,
    reviews: 64,
    tags: ["Emerald", "Gemstone", "Bridal"],
    goldWeight: 22.4,
    totalWeight: 26.1,
  },
  {
    id: "gem-emerald-ring",
    name: "Royal Emerald Ring",
    latin: "Royal Emerald Ring",
    category: "gems",
    price: 1320,
    description:
      "A royal emerald ring encircled by diamonds — a gemstone fit for special occasions.",
    surface: "gold",
    image: "/images/ring-2.jpg",
    newArrival: true,
    rating: 4.9,
    reviews: 37,
    tags: ["Emerald", "Gemstone"],
    goldWeight: 5.6,
    totalWeight: 7.2,
  },
];

/** Product of the day shown on the home hero card. */
export const productOfDay = products.find((p) => p.id === "pd-solitaire")!;

/** Featured (dark green) home product. */
export const featuredProduct = products.find((p) => p.id === "pd-heart-diamond")!;

export const quickActions: QuickAction[] = [
  { label: "Shop by Category", icon: "grid", href: "/shop" },
  { label: "Jewellery Guide", icon: "book", href: "/explore" },
  { label: "Book an Appointment", icon: "calendar", href: "/contact" },
  { label: "New Arrivals", icon: "sparkles", href: "/collections" },
];

/** Trending collections (Explore screen — dark tiles). */
export const trendingCollections: Collection[] = [
  {
    id: "col-royal",
    name: "Royal Heritage",
    latin: "Royal Heritage",
    description: "Gold jewellery inspired by our rich heritage.",
    price: 1200,
    surface: "dark",
    image: "/images/collection-royal.jpg",
  },
  {
    id: "col-modern",
    name: "Modern Balance",
    latin: "Modern Balance",
    description: "Balanced, modern designs for everyday elegance.",
    price: 950,
    surface: "dark",
    image: "/images/collection-modern.jpg",
  },
  {
    id: "col-bridal",
    name: "Bridal Choice",
    latin: "Bridal Choice",
    description: "For your most beautiful moments, on the day of a lifetime.",
    price: 1800,
    surface: "dark",
    image: "/images/collection-bridal.jpg",
  },
];

/** Curated collections list (Collections screen — horizontal cards). */
export const collections: Collection[] = [
  {
    id: "royal-heritage",
    name: "The Royal Heritage",
    latin: "The Royal Heritage",
    description: "Gold jewellery inspired by our rich heritage.",
    price: 2450,
    surface: "dark",
    image: "/images/collection-1.jpg",
  },
  {
    id: "precious-luxe",
    name: "Precious Luxe",
    latin: "Precious Luxe",
    description: "Luxurious gemstone jewellery made to last for generations.",
    price: 3250,
    surface: "dark",
    image: "/images/collection-2.jpg",
  },
  {
    id: "bridal-choice",
    name: "The Bridal Choice",
    latin: "The Bridal Choice",
    description:
      "For your most beautiful moments — designed to remain a lifelong memory.",
    price: 2750,
    surface: "dark",
    image: "/images/collection-3.jpg",
  },
  {
    id: "diamond-elegance",
    name: "Diamond Elegance",
    latin: "Diamond Elegance",
    description: "Classic diamonds, crafted with mastery and passion.",
    price: 1650,
    surface: "cream",
    image: "/images/collection-4.jpg",
  },
  {
    id: "men-collection",
    name: "The Men's Collection",
    latin: "The Men's Collection",
    description: "Bold, elegant designs for the modern man.",
    price: 950,
    surface: "dark",
    image: "/images/collection-5.jpg",
  },
];

/** Gemstone highlight (Explore screen). */
export const gemstoneFeature = {
  title: "Nature's Beauty",
  description:
    "Discover the finest gemstones, adding color to every special moment.",
  price: 2500,
  surface: "gold" as const,
  image: "/images/gemstones.jpg",
};

/** Editorial / info block (Explore screen). */
export const editorialFeature = {
  eyebrow: "Jewellery Guide",
  title: "The Art of Fine Jewellery",
  description: "Learn about craftsmanship, gold purity, gemstones, and more.",
  cta: "Read More",
  surface: "dark" as const,
  image: "/images/editorial.jpg",
};

export const exhibitions: Exhibition[] = [
  {
    id: "ex-bridal",
    title: "Bridal Jewellery Exhibition",
    dateLabel: "Saturday, June 15",
    timeLabel: "10:00 AM",
    venue: "Ariana Gems & Jewellery Studio",
    day: "15",
    month: "June",
  },
];

export const testimonials = [
  {
    id: "t1",
    name: "Noura Al Qahtani",
    text: "Luxurious pieces and exceptional quality — an unforgettable shopping experience.",
    rating: 5,
  },
  {
    id: "t2",
    name: "Sara Al Mansouri",
    text: "The diamonds are flawless and the design is beautifully elegant. Highly recommended.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Reem Al Shamsi",
    text: "Refined service and luxurious packaging — my order arrived faster than I expected.",
    rating: 5,
  },
];
