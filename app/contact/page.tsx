import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ContactForm } from "@/components/contact/ContactForm";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "تواصل مع فريق أريانا أو احجز موعدًا في المعرض.",
};

const info = [
  { icon: Phone, label: "الهاتف", value: "‎+971 4 000 0000" },
  { icon: Mail, label: "البريد", value: "hello@ariana.example" },
  { icon: MapPin, label: "العنوان", value: "دبي، الإمارات العربية المتحدة" },
  { icon: Clock, label: "أوقات العمل", value: "يوميًا · 10 ص – 10 م" },
];

export default function ContactPage() {
  return (
    <AppShell>
      <header className="px-5 pb-2 pt-5" data-reveal>
        <h1 className="font-arabic text-[1.7rem] font-extrabold text-ink">
          تواصل معنا
        </h1>
        <p className="section-sub mt-1">يسعدنا تواصلك، فريقنا في خدمتك دائمًا.</p>
      </header>

      <section className="px-5 py-3">
        <div className="grid grid-cols-2 gap-2.5" data-reveal-stagger>
          {info.map((i) => (
            <div key={i.label} className="card flex flex-col gap-1.5 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cream-100 text-gold-500">
                <i.icon className="h-5 w-5" />
              </span>
              <span className="mt-1 text-[0.68rem] font-bold uppercase tracking-wide text-ink-muted">
                {i.label}
              </span>
              <span className="text-sm font-semibold text-ink">{i.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-5 py-3" data-reveal>
        <h2 className="section-title mb-3">أرسل لنا رسالة</h2>
        <ContactForm />
      </section>

      <Footer />
    </AppShell>
  );
}
