import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm cream backgrounds
        cream: {
          50: "#FCFAF5",
          100: "#F7F1E7",
          200: "#F0E7D6",
          300: "#E7DAC2",
          400: "#DcCBAc",
        },
        // Luxury gold
        gold: {
          50: "#FBF3DF",
          100: "#F4E3B8",
          200: "#E9CE86",
          300: "#DBB65B",
          400: "#CFA23E",
          500: "#C08A28",
          600: "#A5711D",
          700: "#835816",
        },
        // Deep forest green (buttons / featured cards)
        forest: {
          50: "#E8F0EB",
          100: "#C6DACE",
          400: "#2C5A44",
          500: "#204A37",
          600: "#183C2C",
          700: "#123125",
          800: "#0E271E",
          900: "#0A1E17",
        },
        // Terracotta / amber accent ("تسوق الآن")
        clay: {
          400: "#D68A4A",
          500: "#C46E2C",
          600: "#A9591F",
        },
        ink: {
          DEFAULT: "#241B12",
          soft: "#4A3F33",
          muted: "#7A6C5C",
          faint: "#A99B89",
        },
      },
      fontFamily: {
        sans: ["var(--font-tajawal)", "system-ui", "sans-serif"],
        arabic: ["var(--font-tajawal)", "system-ui", "sans-serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        display: ["var(--font-amiri)", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      boxShadow: {
        card: "0 10px 30px -12px rgba(36, 27, 18, 0.18)",
        "card-soft": "0 6px 20px -10px rgba(36, 27, 18, 0.15)",
        gold: "0 12px 30px -12px rgba(192, 138, 40, 0.45)",
        nav: "0 -6px 24px -14px rgba(36, 27, 18, 0.25)",
        pill: "0 2px 10px -4px rgba(36, 27, 18, 0.20)",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #E9CE86 0%, #CFA23E 45%, #A5711D 100%)",
        "forest-gradient":
          "linear-gradient(160deg, #204A37 0%, #123125 100%)",
        "cream-radial":
          "radial-gradient(120% 120% at 50% 0%, #FCFAF5 0%, #F4EAD8 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.6s ease both",
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
