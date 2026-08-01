import { Gem, ShieldCheck, Truck } from "lucide-react";

const points = [
  { icon: Gem, title: "خامات فاخرة", text: "ذهب وأحجار كريمة معتمدة الجودة." },
  { icon: ShieldCheck, title: "ضمان أصلي", text: "شهادة أصالة مع كل قطعة." },
  { icon: Truck, title: "شحن آمن", text: "توصيل مؤمّن إلى باب منزلك." },
];

export function About() {
  return (
    <section className="px-5 py-4">
      <div className="grid grid-cols-3 gap-2.5" data-reveal-stagger>
        {points.map((p) => (
          <div
            key={p.title}
            className="flex flex-col items-center gap-2 rounded-2xl bg-cream-50 px-2 py-4 text-center shadow-card-soft"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-cream-100 text-gold-500 ring-inset-gold">
              <p.icon className="h-5 w-5" />
            </span>
            <span className="text-[0.78rem] font-bold text-ink">{p.title}</span>
            <span className="text-[0.66rem] leading-tight text-ink-muted">{p.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
