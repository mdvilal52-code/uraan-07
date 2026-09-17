"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="card flex flex-col items-center gap-2 p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-forest-500" />
        <h3 className="font-sans text-lg font-bold text-ink">
          Your Message Has Been Sent
        </h3>
        <p className="text-sm text-ink-muted">
          Thank you for reaching out — we&apos;ll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-3 p-4">
      <input
        required
        placeholder="Name"
        aria-label="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-gold-400 placeholder:text-ink-faint"
      />
      <input
        required
        type="email"
        placeholder="Email Address"
        aria-label="Email Address"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-gold-400 placeholder:text-ink-faint"
      />
      <textarea
        required
        rows={4}
        placeholder="Your message…"
        aria-label="Message"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full resize-none rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm outline-none focus:border-gold-400 placeholder:text-ink-faint"
      />
      <button type="submit" disabled={sending} className="btn-forest w-full disabled:opacity-60">
        {sending ? "Sending…" : "Send Message"}
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
