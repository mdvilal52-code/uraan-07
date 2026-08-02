const steps = [
  { n: 1, label: "الشحن" },
  { n: 2, label: "الدفع" },
] as const;

export function CheckoutStepper({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 px-5 pb-1 pt-2">
      {steps.map((s, i) => (
        <div key={s.n} className="flex flex-1 items-center gap-2 last:flex-none">
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold transition ${
                step >= s.n
                  ? "bg-forest-600 text-cream-50"
                  : "bg-cream-200 text-ink-faint"
              }`}
            >
              {s.n}
            </span>
            <span
              className={`text-sm font-bold transition ${
                step >= s.n ? "text-ink" : "text-ink-faint"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span
              className={`h-0.5 flex-1 rounded-full transition ${
                step > s.n ? "bg-forest-600" : "bg-cream-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
