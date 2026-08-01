import Image from "next/image";
import type { GemSurface } from "@/types";
import { CategoryIcon } from "./icons/JewelIcons";

/**
 * ProductImage
 * ------------
 * Renders a product photo (`src`) via next/image on top of a warm
 * gem-lit surface. When no `src` is supplied it falls back to an elegant
 * placeholder with a faint jewellery watermark, so the layout stays
 * pixel-accurate even before art exists.
 */
export function ProductImage({
  src,
  surface = "gold",
  icon = "gem",
  ratio = "square",
  rounded = "rounded-2xl",
  className = "",
  label,
  shimmer = false,
  sizes = "(max-width: 480px) 50vw, 240px",
  priority = false,
}: {
  src?: string;
  surface?: GemSurface;
  icon?: string;
  ratio?: "square" | "portrait" | "landscape" | "wide" | "auto";
  rounded?: string;
  className?: string;
  label?: string;
  shimmer?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  const ratioClass =
    ratio === "square"
      ? "aspect-square"
      : ratio === "portrait"
        ? "aspect-[3/4]"
        : ratio === "landscape"
          ? "aspect-[4/3]"
          : ratio === "wide"
            ? "aspect-[16/10]"
            : "";

  const surfaceClass =
    surface === "dark"
      ? "gem-surface--dark text-gold-200"
      : surface === "cream"
        ? "gem-surface--cream text-gold-500/60"
        : "gem-surface text-gold-600/50";

  return (
    <div
      className={`relative overflow-hidden ${rounded} ${ratioClass} ${surfaceClass} ${className}`}
      role="img"
      aria-label={label ? `${label}` : "صورة مجوهرات"}
    >
      {src ? (
        <Image
          src={src}
          alt={label ?? "مجوهرات"}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <CategoryIcon
            name={icon}
            className="h-2/5 w-2/5 opacity-40 drop-shadow-sm"
          />
        </div>
      )}

      {/* soft gloss */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tl from-white/0 via-white/5 to-white/20" />
      {shimmer && !src && (
        <div className="shimmer-surface pointer-events-none absolute inset-0 animate-shimmer" />
      )}
    </div>
  );
}
