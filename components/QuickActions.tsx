import Link from "next/link";
import { LayoutGrid, BookOpen, CalendarClock, Sparkles } from "lucide-react";
import { quickActions } from "@/data/jewelleryData";

const iconMap: Record<string, typeof LayoutGrid> = {
  grid: LayoutGrid,
  book: BookOpen,
  calendar: CalendarClock,
  sparkles: Sparkles,
};

export function QuickActions() {
  return (
    <section className="px-5 py-4">
      <div className="grid grid-cols-4 gap-2.5" data-reveal-stagger>
        {quickActions.map((a) => {
          const Icon = iconMap[a.icon] ?? Sparkles;
          return (
            <Link
              key={a.label}
              href={a.href}
              className="press flex flex-col items-center gap-2 rounded-2xl bg-cream-50 px-1 py-3.5 text-center shadow-card-soft"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-cream-100 text-gold-500 ring-inset-gold">
                <Icon className="h-[1.35rem] w-[1.35rem]" strokeWidth={2} />
              </span>
              <span className="text-[0.68rem] font-bold leading-tight text-ink">
                {a.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
