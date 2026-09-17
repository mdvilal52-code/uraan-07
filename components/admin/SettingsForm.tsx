"use client";

import { useState } from "react";
import { Save, CheckCircle2 } from "lucide-react";

const inputCls =
  "w-full rounded-2xl border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-ink outline-none transition focus:border-gold-400 placeholder:text-ink-faint";

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
  const [saved, setSaved] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }}
      className="space-y-5"
    >
      <Card title="Store Information">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">
              Store Name
            </span>
            <input className={inputCls} defaultValue="Ariana Gems & Jewellery" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">
              Email Address
            </span>
            <input className={inputCls} defaultValue="hello@ariana.example" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">
              Phone Number
            </span>
            <input className={inputCls} defaultValue="+61 3 9791 1331" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">
              Currency
            </span>
            <select className={inputCls} defaultValue="AUD">
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
            <input type="number" className={inputCls} defaultValue={500} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-bold text-ink-soft">
              Tax Rate (%)
            </span>
            <input type="number" className={inputCls} defaultValue={5} />
          </label>
        </div>
      </Card>

      <Card title="Notifications">
        <label className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">
            New Order Notifications
          </span>
          <input type="checkbox" defaultChecked className="h-4 w-4 accent-forest-600" />
        </label>
        <label className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">
            Low Stock Alerts
          </span>
          <input type="checkbox" defaultChecked className="h-4 w-4 accent-forest-600" />
        </label>
      </Card>

      <button type="submit" className="btn-forest w-full sm:w-auto">
        {saved ? (
          <>
            <CheckCircle2 className="h-4 w-4" /> Saved
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
