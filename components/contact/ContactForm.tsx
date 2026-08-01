"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="card flex flex-col items-center gap-2 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-forest-500" />
        <h3 className="font-arabic text-lg font-bold text-ink">
          تمّ إرسال رسالتك
        </h3>
        <p className="text-sm text-ink-muted">
          شكرًا لتواصلك معنا، سنردّ عليكِ في أقرب وقت.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="card space-y-3 p-4"
    >
      <input
        required
        placeholder="الاسم"
        aria-label="الاسم"
        className="w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-gold-400 placeholder:text-ink-faint"
      />
      <input
        required
        type="email"
        placeholder="البريد الإلكتروني"
        aria-label="البريد الإلكتروني"
        className="w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-gold-400 placeholder:text-ink-faint"
      />
      <textarea
        required
        rows={4}
        placeholder="رسالتك…"
        aria-label="الرسالة"
        className="w-full resize-none rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-gold-400 placeholder:text-ink-faint"
      />
      <button type="submit" className="btn-forest w-full">
        إرسال الرسالة
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
