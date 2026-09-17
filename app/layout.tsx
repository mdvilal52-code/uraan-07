import type { Metadata, Viewport } from "next";
import { Tajawal, Cormorant_Garamond } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import "../styles/luxury.css";
import "../styles/animations.css";

// Only the weights the UI actually uses are loaded (body 400, bold 700,
// extrabold 800 — `font-semibold` resolves to 700, Tajawal has no 600).
// Fewer weights = fewer preloaded font files = faster first paint. The
// storefront is English-only, so only the Latin subset is loaded.
const tajawal = Tajawal({
  subsets: ["latin"],
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
    default: "Ariana Gems & Jewellery | Arabic Gold Jewellery Online",
    template: "%s | Ariana Gems & Jewellery",
  },
  description:
    "Ariana — exquisite Arabic and Gulf-inspired gold jewellery, handcrafted with care. Shop gold necklaces, earrings, rings and bracelets in the finest materials at competitive prices.",
  keywords: [
    "Arabic gold jewellery",
    "Gulf gold jewellery",
    "gold necklaces",
    "gold rings",
    "gold earrings",
    "gold bracelets",
    "jewellery",
    "gemstones",
    "gold",
    "diamond",
  ],
  authors: [{ name: "Ariana Gems & Jewellery" }],
  openGraph: {
    title: "Ariana Gems & Jewellery | Arabic Gold Jewellery Online",
    description:
      "Exquisite Arabic and Gulf-inspired gold jewellery, handcrafted with care — shine forever, brilliance without end.",
    type: "website",
    locale: "en_AU",
    siteName: "Ariana Gems & Jewellery",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ariana Gems & Jewellery | Arabic Gold Jewellery Online",
    description:
      "Exquisite Arabic and Gulf-inspired gold jewellery, handcrafted with care — shine forever, brilliance without end.",
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
      lang="en"
      dir="ltr"
      className={`${tajawal.variable} ${cormorant.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
