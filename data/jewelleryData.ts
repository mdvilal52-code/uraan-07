import type {
  Category,
  Collection,
  Exhibition,
  Product,
  QuickAction,
} from "@/types";

/* ============================================================
   Central content source for Ariana Gems & Jewellery.
   All Arabic copy is written in natural, professional Gulf Arabic.
   Prices are in AUD.
   ============================================================ */

export const BRAND = {
  name: "Ariana",
  tagline: "GEMS & JEWELLERY PVT",
  arabicName: "أريانا",
} as const;

/** Store contact details (single source of truth for footer + contact page). */
export const CONTACT = {
  address: "27C Langhorne St, Dandenong VIC 3175, Australia",
  phoneIntl: "+61 3 9791 1331",
  phoneLocal: "(03) 9791 1331",
  phoneHref: "tel:+61397911331",
  email: "hello@ariana.example",
  hours: "يوميًا · 10 ص – 10 م",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=27C+Langhorne+St+Dandenong+VIC+3175+Australia",
  social: {
    facebook: "https://www.facebook.com/share/14knXVAZFtt/",
    instagram:
      "https://www.instagram.com/ariana_gems_jewellery?igsh=dDQwbDFrMmVvazBq",
  },
} as const;

export const categories: Category[] = [
  { slug: "necklaces", name: "قلائد", latin: "Necklaces", icon: "necklace" },
  { slug: "earrings", name: "أقراط", latin: "Earrings", icon: "earring" },
  { slug: "rings", name: "خواتم", latin: "Rings", icon: "ring" },
  { slug: "bracelets", name: "أساور", latin: "Bracelets", icon: "bracelet" },
  { slug: "pendants", name: "معلّقات", latin: "Pendants", icon: "pendant" },
];

export const categoryNameBySlug: Record<string, string> = {
  necklaces: "القلائد",
  earrings: "الأقراط",
  rings: "الخواتم",
  bracelets: "الأساور",
  pendants: "المعلّقات",
};

export const products: Product[] = [
  // القلائد — Necklaces
  {
    id: "nk-diamond-maas",
    name: "قلادة ماس ألماسي",
    latin: "Diamond Maas Necklace",
    category: "necklaces",
    price: 2450,
    description: "قلادة ماسية بتصميم كلاسيكي راقٍ يليق بأرقى المناسبات.",
    surface: "gold",
    image: "/images/necklace.jpg",
    bestSeller: true,
    newArrival: true,
    rating: 4.9,
    reviews: 128,
    tags: ["ألماس", "زفاف"],
  },
  {
    id: "nk-polki",
    name: "قلادة بولكي",
    latin: "Polki Necklace",
    category: "necklaces",
    price: 1650,
    description: "قلادة بولكي مستوحاة من التراث الملكي بلمسة عصرية.",
    surface: "gold",
    image: "/images/necklace-2.jpg",
    bestSeller: true,
    rating: 4.8,
    reviews: 94,
    tags: ["تراث", "ذهب"],
  },
  // الأقراط — Earrings
  {
    id: "er-maas",
    name: "أقراط ماس",
    latin: "Maas Earrings",
    category: "earrings",
    price: 760,
    description: "أقراط ماسية لامعة تمنح إطلالتك بريقًا لا يُقاوم.",
    surface: "cream",
    image: "/images/earrings.jpg",
    newArrival: true,
    rating: 4.9,
    reviews: 76,
    tags: ["ألماس"],
  },
  {
    id: "er-jhumka",
    name: "أقراط جومكا",
    latin: "Jhumka Earrings",
    category: "earrings",
    price: 565,
    description: "أقراط جومكا ذهبية بتفاصيل يدوية دقيقة وأناقة أصيلة.",
    surface: "gold",
    image: "/images/earrings-2.jpg",
    rating: 4.7,
    reviews: 58,
    tags: ["ذهب", "تراث"],
  },
  // الخواتم — Rings
  {
    id: "rg-solitaire",
    name: "خاتم سوليتير",
    latin: "Solitaire Ring",
    category: "rings",
    price: 1100,
    description: "خاتم سوليتير بحجر ماس مركزي يخطف الأنظار من أول نظرة.",
    surface: "cream",
    image: "/images/ring.jpg",
    bestSeller: true,
    rating: 5.0,
    reviews: 210,
    tags: ["ألماس", "خطوبة"],
  },
  {
    id: "rg-gemstone",
    name: "خاتم أحجار كريمة",
    latin: "Gemstone Ring",
    category: "rings",
    price: 925,
    description: "خاتم مرصّع بأحجار كريمة زمرّدية تحيط بها حبّات الألماس.",
    surface: "gold",
    image: "/images/ring-2.jpg",
    rating: 4.8,
    reviews: 63,
    tags: ["زمرّد", "أحجار كريمة"],
  },
  // الأساور — Bracelets
  {
    id: "br-diamond",
    name: "سوار ألماسي",
    latin: "Diamond Bracelet",
    category: "bracelets",
    price: 2250,
    description: "سوار ألماسي رفيع يلتفّ حول معصمك ببريقٍ متواصل.",
    surface: "cream",
    image: "/images/bracelet.jpg",
    bestSeller: true,
    rating: 4.9,
    reviews: 88,
    tags: ["ألماس"],
  },
  {
    id: "br-gold",
    name: "سوار من الذهب",
    latin: "Gold Bracelet",
    category: "bracelets",
    price: 1580,
    description: "سوار ذهبي مرصّع بأحجار الزمرّد لإطلالة ملكية أنيقة.",
    surface: "gold",
    image: "/images/bracelet-2.jpg",
    newArrival: true,
    rating: 4.7,
    reviews: 41,
    tags: ["ذهب", "زمرّد"],
  },
  // المعلّقات — Pendants
  {
    id: "pd-heart-diamond",
    name: "قلادة حب الماسية",
    latin: "Diamond Love Pendant",
    category: "pendants",
    price: 3250,
    description:
      "رمزٌ للحب، مصنوعة من الذهب ومرصّعة بالماس الحقيقي لتبقى ذكرى خالدة.",
    surface: "dark",
    image: "/images/heart-pendant.jpg",
    bestSeller: true,
    newArrival: true,
    rating: 5.0,
    reviews: 156,
    tags: ["ألماس", "ذهب", "هدية"],
  },
  {
    id: "pd-solitaire",
    name: "قلادة سوليتير ماسية",
    latin: "Solitaire Diamond Pendant",
    category: "pendants",
    price: 1450,
    description: "جمالٌ في كل بريق — قلادة سوليتير ماسية أنيقة وخالدة.",
    surface: "cream",
    image: "/images/pendant.jpg",
    newArrival: true,
    rating: 4.9,
    reviews: 73,
    tags: ["ألماس"],
  },
];

/** Product of the day shown on the home hero card. */
export const productOfDay = products.find((p) => p.id === "pd-solitaire")!;

/** Featured (dark green) home product. */
export const featuredProduct = products.find((p) => p.id === "pd-heart-diamond")!;

export const quickActions: QuickAction[] = [
  { label: "تسوّق حسب الفئة", icon: "grid", href: "/shop" },
  { label: "دليل المجوهرات", icon: "book", href: "/explore" },
  { label: "احجز موعدًا", icon: "calendar", href: "/contact" },
  { label: "وصل حديثًا", icon: "sparkles", href: "/collections" },
];

/** Trending collections (Explore screen — dark tiles). */
export const trendingCollections: Collection[] = [
  {
    id: "col-royal",
    name: "تراث ملكي",
    latin: "Royal Heritage",
    description: "مجوهرات بولكي مستوحاة من تراثنا الغني.",
    price: 1200,
    surface: "dark",
    image: "/images/collection-royal.jpg",
  },
  {
    id: "col-modern",
    name: "موزون عصري",
    latin: "Modern Balance",
    description: "تصاميم عصرية متوازنة لكل يوم.",
    price: 950,
    surface: "dark",
    image: "/images/collection-modern.jpg",
  },
  {
    id: "col-bridal",
    name: "خيار العروس",
    latin: "Bridal Choice",
    description: "لأجمل لحظاتك في يوم العمر.",
    price: 1800,
    surface: "dark",
    image: "/images/collection-bridal.jpg",
  },
];

/** Curated collections list (Collections screen — horizontal cards). */
export const collections: Collection[] = [
  {
    id: "royal-heritage",
    name: "التراث الملكي",
    latin: "The Royal Heritage",
    description: "مجوهرات بولكي مستوحاة من تراثنا الغني.",
    price: 2450,
    surface: "dark",
    image: "/images/collection-1.jpg",
  },
  {
    id: "precious-luxe",
    name: "أحجار ثمينة فاخرة",
    latin: "Precious Luxe",
    description: "مجوهرات أحجار فاخرة تدوم لأجيال.",
    price: 3250,
    surface: "dark",
    image: "/images/collection-2.jpg",
  },
  {
    id: "bridal-choice",
    name: "خيار العروس",
    latin: "The Bridal Choice",
    description: "لأجمل لحظاتك، صُمّمت لتبقى ذكرى مدى الحياة.",
    price: 2750,
    surface: "dark",
    image: "/images/collection-3.jpg",
  },
  {
    id: "diamond-elegance",
    name: "أناقة الألماس",
    latin: "Diamond Elegance",
    description: "ألماس كلاسيكي مصنوع بإتقانٍ وشغف.",
    price: 1650,
    surface: "cream",
    image: "/images/collection-4.jpg",
  },
  {
    id: "men-collection",
    name: "مجموعة الرجال",
    latin: "The Men's Collection",
    description: "تصاميم جريئة وأنيقة للرجل العصري.",
    price: 950,
    surface: "dark",
    image: "/images/collection-5.jpg",
  },
];

/** Gemstone highlight (Explore screen). */
export const gemstoneFeature = {
  title: "جمال الطبيعة",
  description:
    "اكتشف أجود الأحجار الكريمة التي تُضيف لونًا لكل لحظة مميّزة.",
  price: 2500,
  surface: "gold" as const,
  image: "/images/gemstones.jpg",
};

/** Editorial / info block (Explore screen). */
export const editorialFeature = {
  eyebrow: "معلومات عن المجوهرات",
  title: "فنّ صناعة المجوهرات",
  description: "تعرّف على الحِرفية، والعيارات، والأحجار الكريمة، والمزيد.",
  cta: "اقرأ المزيد",
  surface: "dark" as const,
  image: "/images/editorial.jpg",
};

export const exhibitions: Exhibition[] = [
  {
    id: "ex-bridal",
    title: "معرض مجوهرات الزفاف",
    dateLabel: "السبت، 15 يونيو",
    timeLabel: "10:00 صباحًا",
    venue: "Ariana Gems & Jewellery Studio",
    day: "15",
    month: "يونيو",
  },
];

export const testimonials = [
  {
    id: "t1",
    name: "نورة القحطاني",
    text: "قطعٌ فاخرة وجودة استثنائية، تجربة تسوّق لا تُنسى.",
    rating: 5,
  },
  {
    id: "t2",
    name: "سارة المنصوري",
    text: "الألماس نظيف والتصميم أنيق جدًا. أنصح به بشدّة.",
    rating: 5,
  },
  {
    id: "t3",
    name: "ريم الشامسي",
    text: "خدمة راقية وتغليف فخم، وصلني الطلب أسرع مما توقّعت.",
    rating: 5,
  },
];
