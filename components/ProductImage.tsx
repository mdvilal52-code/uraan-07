import type { GemSurface } from "@/types";
import { CategoryIcon } from "./icons/JewelIcons";

/**
 * ProductImage
 * ------------
 * An elegant, self-contained placeholder that renders a warm gem-lit
 * surface with a faint jewellery watermark. This keeps the layout
 * pixel-accurate before real photography is available.
 *
 * To use real HD photos later: drop the file at `src` inside /public
 * and swap the placeholder <div> for a next/image <Image> — the
 * surrounding markup + aspect ratio stay identical.
 */
export function ProductImage({
  surface = "gold",
  icon = "gem",
  ratio = "square",
  rounded = "rounded-2xl",
  className = "",
  label,
  shimmer = false,
}: {
  surface?: GemSurface;
  icon?: string;
  ratio?: "square" | "portrait" | "landscape" | "wide" | "auto";
  rounded?: string;
  className?: string;
  label?: string;
  shimmer?: boolean;
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
      aria-label={label ? `${label} — صورة توضيحية` : "صورة توضيحية للمجوهرات"}
    >
      {/* faint jewellery watermark */}
      <div className="absolute inset-0 grid place-items-center">
        <CategoryIcon
          name={icon}
          className="h-2/5 w-2/5 opacity-40 drop-shadow-sm"
        />
      </div>
      {/* soft gloss */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tl from-white/0 via-white/5 to-white/25" />
      {shimmer && (
        <div className="shimmer-surface pointer-events-none absolute inset-0 animate-shimmer" />
      )}
    </div>
  );
}
