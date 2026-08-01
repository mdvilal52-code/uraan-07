import Link from "next/link";
import { Instagram, Facebook, Twitter, Mail, Phone } from "lucide-react";
import { LotusMark } from "./icons/JewelIcons";
import { BRAND } from "@/data/jewelleryData";

const columns = [
  {
    title: "تسوّق",
    links: [
      { label: "القلائد", href: "/shop?category=necklaces" },
      { label: "الأقراط", href: "/shop?category=earrings" },
      { label: "الخواتم", href: "/shop?category=rings" },
      { label: "الأساور", href: "/shop?category=bracelets" },
    ],
  },
  {
    title: "الشركة",
    links: [
      { label: "من نحن", href: "/about" },
      { label: "المجموعات", href: "/collections" },
      { label: "تواصل معنا", href: "/contact" },
      { label: "المتجر", href: "/shop" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-forest-700 px-5 pb-8 pt-10 text-cream-100">
      <div className="flex items-center gap-2">
        <LotusMark className="h-9 w-9" />
        <span className="flex flex-col leading-none">
          <span className="font-serif text-2xl font-semibold text-cream-50">
            {BRAND.name}
          </span>
          <span className="text-[0.5rem] font-semibold uppercase tracking-[0.22em] text-gold-200">
            {BRAND.tagline}
          </span>
        </span>
      </div>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream-200/80">
        أحجار كريمة ومجوهرات فاخرة مصنوعة بعناية — تألّقي للأبد، بريقٌ لا ينتهي.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-6">
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 font-arabic text-sm font-bold text-gold-200">
              {col.title}
            </h3>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-cream-200/85 transition hover:text-cream-50"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-2 text-sm text-cream-200/85">
        <a href="tel:+97140000000" className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gold-200" /> ‎+971 4 000 0000
        </a>
        <a href="mailto:hello@ariana.example" className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gold-200" /> hello@ariana.example
        </a>
      </div>

      <div className="mt-6 flex gap-3">
        {[Instagram, Facebook, Twitter].map((Icon, i) => (
          <a
            key={i}
            href="#"
            aria-label="تواصل اجتماعي"
            className="grid h-10 w-10 place-items-center rounded-xl bg-forest-600 text-cream-100 transition hover:bg-forest-500"
          >
            <Icon className="h-[1.1rem] w-[1.1rem]" />
          </a>
        ))}
      </div>

      <hr className="my-6 border-forest-500/40" />
      <p className="text-center text-xs text-cream-200/70">
        © {new Date().getFullYear()} {BRAND.name} Gems &amp; Jewellery. جميع الحقوق محفوظة.
      </p>
    </footer>
  );
}
