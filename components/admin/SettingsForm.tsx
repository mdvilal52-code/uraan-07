"use client";

import { useEffect, useState } from "react";
import { Save, CheckCircle2, Loader2 } from "lucide-react";

const inputCls =
  "w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-400 placeholder:text-ink-faint";

interface Settings {
  storeName: string;
  email: string;
  phone: string;
  currency: string;
  freeShippingThreshold: number;
  taxRatePercent: number;
  notifyNewOrders: boolean;
  notifyLowStock: boolean;
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card space-y-4 p-5">
      <h3 className="font-sans text-base font-bold text-ink">{title}</h3>
      {children}
    </div>
  );
}

export function SettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .catch(() => setError("Unable to load settings"));
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body = {
      storeName: fd.get("storeName"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      currency: fd.get("currency"),
      freeShippingThreshold: Number(fd.get("freeShippingThreshold")) || 0,
      taxRatePercent: Number(fd.get("taxRatePercent")) || 0,
      notifyNewOrders: fd.get("notifyNewOrders") === "on",
      notifyLowStock: fd.get("notifyLowStock") === "on",
    };
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Unable to save settings");
      return;
    }
    setSettings(data.settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!settings) {
    return (
      <div className="card grid place-items-center py-16 text-ink-muted">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Free Shipping Threshold below is live: lib/db.ts priceCart() reads
          it from StoreSettings on every cart/checkout price. Tax Rate is
          still not applied to any order total (no tax line exists in the
          checkout UI yet), and store contact details shown to customers
          still come from data/jewelleryData.ts, not these fields — both
          remain separate follow-up work. */}
      <Card title="Store Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">
              Store Name
            </span>
            <input name="storeName" className={inputCls} defaultValue={settings.storeName} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">
              Email Address
            </span>
            <input name="email" type="email" className={inputCls} defaultValue={settings.email} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">
              Phone Number
            </span>
            <input name="phone" className={inputCls} defaultValue={settings.phone} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">
              Currency
            </span>
            <select name="currency" defaultValue={settings.currency} className={inputCls}>
              <option value="AUD">Australian Dollar (AUD)</option>
              <option value="AED">UAE Dirham (AED)</option>
              <option value="USD">US Dollar (USD)</option>
            </select>
          </label>
        </div>
      </Card>

      <Card title="Shipping & Taxes">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">
              Free Shipping Threshold (AUD)
            </span>
            <input
              name="freeShippingThreshold"
              type="number"
              min={0}
              className={inputCls}
              defaultValue={settings.freeShippingThreshold}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">
              Tax Rate (%)
            </span>
            <input
              name="taxRatePercent"
              type="number"
              min={0}
              step="0.1"
              className={inputCls}
              defaultValue={settings.taxRatePercent}
            />
          </label>
        </div>
      </Card>

      <Card title="Notifications">
        <label className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">
            New Order Notifications
          </span>
          <input
            name="notifyNewOrders"
            type="checkbox"
            defaultChecked={settings.notifyNewOrders}
            className="h-4 w-4 accent-forest-600"
          />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">
            Low Stock Alerts
          </span>
          <input
            name="notifyLowStock"
            type="checkbox"
            defaultChecked={settings.notifyLowStock}
            className="h-4 w-4 accent-forest-600"
          />
        </label>
      </Card>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <button type="submit" disabled={saving} className="btn-forest w-full sm:w-auto disabled:opacity-60">
        {saved ? (
          <>
            <CheckCircle2 className="h-4 w-4" /> Saved
          </>
        ) : saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Saving…
          </>
        ) : (
          <>
            <Save className="h-4 w-4" /> Save Settings
          </>
        )}
      </button>
    </form>
  );
}
