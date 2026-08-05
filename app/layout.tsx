import type { Metadata, Viewport } from "next";
import { Tajawal, Cormorant_Garamond } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { DomResilience } from "@/components/DomResilience";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import "../styles/luxury.css";
import "../styles/animations.css";

// Only the weights the UI actually uses are loaded (body 400, bold 700,
// extrabold 800 — `font-semibold` resolves to 700, Tajawal has no 600).
// Fewer weights = fewer preloaded font files = faster first paint.
const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

// Brand wordmark only — always rendered at `font-semibold` (600).
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "أريانا للأحجار الكريمة والمجوهرات | Ariana Gems & Jewellery",
    template: "%s | أريانا",
  },
  description:
    "أريانا — أحجار كريمة ومجوهرات فاخرة مصنوعة بعناية. تسوّق القلائد والأقراط والخواتم والأساور بأجود الخامات وأسعار تنافسية.",
  keywords: [
    "مجوهرات",
    "أحجار كريمة",
    "قلائد",
    "خواتم",
    "أقراط",
    "أساور",
    "ذهب",
    "ألماس",
    "jewellery",
    "gems",
    "gold",
    "diamond",
  ],
  authors: [{ name: "Ariana Gems & Jewellery" }],
  openGraph: {
    title: "أريانا للأحجار الكريمة والمجوهرات",
    description:
      "أحجار كريمة ومجوهرات فاخرة مصنوعة بعناية — تألّقي للأبد، بريقٌ لا ينتهي.",
    type: "website",
    locale: "ar_AE",
    siteName: "Ariana Gems & Jewellery",
  },
  twitter: {
    card: "summary_large_image",
    title: "أريانا للأحجار الكريمة والمجوهرات",
    description:
      "أحجار كريمة ومجوهرات فاخرة مصنوعة بعناية — تألّقي للأبد، بريقٌ لا ينتهي.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#123125",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${cormorant.variable}`}
    >
      <body>
        {/* Installs the DOM-resilience guard as the initial bundle evaluates,
            before hydration, so a translation extension reparenting a node
            can't crash React's next commit. See lib/domResilience. */}
        <DomResilience />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
