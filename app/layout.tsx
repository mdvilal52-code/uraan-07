import type { Metadata, Viewport } from "next";
import { Tajawal, Cormorant_Garamond, Amiri } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";
import "../styles/luxury.css";
import "../styles/animations.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ariana-jewellery.example"),
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
      className={`${tajawal.variable} ${cormorant.variable} ${amiri.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
