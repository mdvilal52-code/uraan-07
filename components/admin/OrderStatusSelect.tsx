"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "./StatusBadge";
import type { Order } from "@/types";

const STATUSES: Order["status"][] = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

/** Styled as the static StatusBadge, but an actual <select> underneath makes
 *  it a real control — admins can change an order's status inline instead of
 *  it being permanently stuck at whatever it was created with. */
export function OrderStatusSelect({
  id,
  status,
}: {
  id: string;
  status: Order["status"];
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);

  async function change(next: Order["status"]) {
    if (next === current || saving) return;
    const previous = current;
    setCurrent(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setCurrent(previous);
        return;
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <label className="relative inline-flex cursor-pointer">
      <select
        value={current}
        disabled={saving}
        onChange={(e) => change(e.target.value as Order["status"])}
        aria-label="Order status"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-wait"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </option>
        ))}
      </select>
      <span className={saving ? "opacity-50" : ""}>
        <StatusBadge status={current} />
      </span>
    </label>
  );
}
