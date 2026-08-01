import { LotusMark } from "./icons/JewelIcons";

export function Loader({ label = "جارٍ التحميل…" }: { label?: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="flex flex-col items-center gap-4">
        <LotusMark className="h-14 w-14 animate-float" />
        <div className="h-1 w-28 overflow-hidden rounded-full bg-cream-300">
          <div className="h-full w-1/2 rounded-full bg-gold-gradient shimmer-surface animate-shimmer" />
        </div>
        <p className="font-arabic text-sm text-ink-muted">{label}</p>
      </div>
    </div>
  );
}
