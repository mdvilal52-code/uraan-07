"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ShieldCheck,
  UserCircle,
  Loader2,
  Plus,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { formatPrice } from "@/lib/currency";
import type { Order } from "@/types";

type Section = "main" | "orders" | "addresses" | "payment" | "notifications" | "settings";

interface Address {
  id: string;
  label: string;
  line: string;
  city: string;
  postcode: string;
}

export function ProfileView() {
  const { user, loading, logout } = useAuth();
  const { count: wishCount } = useWishlist();
  const router = useRouter();
  const [section, setSection] = useState<Section>("main");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesReady, setAddressesReady] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [nameEdit, setNameEdit] = useState("");
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    if (section === "orders") {
      setOrdersLoading(true);
      fetch("/api/orders")
        .then((r) => r.json())
        .then((d) => setOrders(d.orders ?? []))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [section]);

  // Hydrate from localStorage after mount (not during render) so the
  // client's first render always matches the server-rendered HTML —
  // reading localStorage inside a useState initializer runs on the client
  // but not the server, which would otherwise mismatch during hydration.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ariana_addresses");
      if (raw) setAddresses(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setAddressesReady(true);
  }, []);

  useEffect(() => {
    if (!addressesReady) return;
    try {
      localStorage.setItem("ariana_addresses", JSON.stringify(addresses));
    } catch {
      /* storage may be unavailable (private mode, quota, embedded webview) */
    }
  }, [addresses, addressesReady]);

  if (loading) {
    return (
      <div className="grid place-items-center py-24 text-ink-muted">
        <Loader2 className="h-7 w-7 animate-spin text-gold-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid place-items-center px-5 py-20 text-center">
        <UserCircle className="h-16 w-16 text-cream-400" />
        <h2 className="mt-4 font-arabic text-lg font-bold text-ink">
          مرحبًا بكِ في أريانا
        </h2>
        <p className="mt-1 max-w-xs text-sm text-ink-muted">
          سجّلي الدخول أو أنشئي حسابًا لمتابعة طلباتك وتفضيلاتك.
        </p>
        <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
          <Link href="/login" className="btn-forest w-full">
            تسجيل الدخول
          </Link>
          <Link href="/register" className="btn-outline w-full">
            إنشاء حساب
          </Link>
        </div>
      </div>
    );
  }

  if (section !== "main") {
    return (
      <>
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <button
            onClick={() => setSection("main")}
            className="grid h-9 w-9 place-items-center rounded-xl bg-cream-100 text-ink"
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </button>
          <h2 className="font-arabic text-lg font-bold text-ink">
            {section === "orders" && "طلباتي"}
            {section === "addresses" && "عناويني"}
            {section === "payment" && "طرق الدفع"}
            {section === "notifications" && "الإشعارات"}
            {section === "settings" && "الإعدادات"}
          </h2>
        </div>

        <div className="px-5 pb-6">
          {section === "orders" && <OrdersSection orders={orders} loading={ordersLoading} />}
          {section === "addresses" && (
            <AddressesSection addresses={addresses} setAddresses={setAddresses} />
          )}
          {section === "payment" && <PaymentSection />}
          {section === "notifications" && (
            <NotificationsSection enabled={notifEnabled} setEnabled={setNotifEnabled} />
          )}
          {section === "settings" && (
            <SettingsSection
              user={user}
              nameEdit={nameEdit}
              setNameEdit={setNameEdit}
              editingName={editingName}
              setEditingName={setEditingName}
            />
          )}
        </div>
      </>
    );
  }

  const menu = [
    { icon: Package, label: "طلباتي", key: "orders" as Section },
    { icon: Heart, label: "المفضّلة", key: "wishlist" as const },
    { icon: MapPin, label: "عناويني", key: "addresses" as Section },
    { icon: CreditCard, label: "طرق الدفع", key: "payment" as Section },
    { icon: Bell, label: "الإشعارات", key: "notifications" as Section },
    { icon: Settings, label: "الإعدادات", key: "settings" as Section },
  ];

  return (
    <>
      <section className="px-5 pb-2 pt-5">
        <div className="overflow-hidden rounded-3xl bg-forest-gradient p-5 text-cream-50">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gold-gradient font-arabic text-2xl font-extrabold text-forest-800">
              {(user.name || user.email || "؟").charAt(0)}
            </div>
            <div>
              <h1 className="font-arabic text-xl font-bold text-cream-50">
                {user.name}
              </h1>
              <p className="text-sm text-cream-200/80">{user.email}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-forest-600/70 px-2 py-0.5 text-[0.65rem] font-bold text-gold-200">
                <ShieldCheck className="h-3 w-3" /> عضوة أريانا
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[
              { label: "الطلبات", value: String(orders.length || "0") },
              { label: "المفضّلة", value: String(wishCount) },
              { label: "العناوين", value: String(addresses.length) },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-forest-600/40 py-2">
                <p className="font-arabic text-base font-extrabold text-gold-200">
                  {s.value}
                </p>
                <p className="text-[0.66rem] text-cream-200/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-3">
        <div className="card divide-y divide-cream-200 overflow-hidden">
          {menu.map((m) => (
            <button
              key={m.label}
              type="button"
              onClick={() => {
                if (m.key === "wishlist") {
                  router.push("/wishlist");
                } else {
                  setSection(m.key);
                }
              }}
              className="flex w-full items-center gap-3 px-4 py-3.5 transition hover:bg-cream-100"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-cream-100 text-gold-500">
                <m.icon className="h-5 w-5" />
              </span>
              <span className="flex-1 text-start font-arabic text-sm font-bold text-ink">
                {m.label}
              </span>
              <ChevronLeft className="h-4 w-4 text-ink-faint" />
            </button>
          ))}
        </div>

        <button
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-cream-300 bg-cream-50 py-3.5 text-sm font-bold text-clay-500 shadow-card-soft"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </section>
    </>
  );
}

/* ---------- Sub-sections ---------- */

function OrdersSection({ orders, loading }: { orders: Order[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid place-items-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="grid place-items-center py-12 text-center">
        <Package className="h-12 w-12 text-cream-400" />
        <p className="mt-3 text-sm text-ink-muted">لا توجد طلبات حتى الآن.</p>
        <Link href="/shop" className="btn-forest mt-4">
          تصفّح المتجر
        </Link>
      </div>
    );
  }

  const statusLabel: Record<string, string> = {
    pending: "قيد الانتظار",
    paid: "مدفوع",
    shipped: "تم الشحن",
    delivered: "تم التوصيل",
    cancelled: "ملغي",
  };
  const statusColor: Record<string, string> = {
    pending: "bg-gold-100 text-gold-700",
    paid: "bg-forest-100 text-forest-700",
    shipped: "bg-blue-100 text-blue-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
  };

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div key={o.id} className="card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-ink" dir="ltr">{o.id}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold ${statusColor[o.status] ?? "bg-cream-200 text-ink-muted"}`}>
              {statusLabel[o.status] ?? o.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-ink-muted">
            <span>{o.items} قطعة</span>
            <span className="price text-sm">{formatPrice(o.total)}</span>
          </div>
          <p className="text-xs text-ink-faint" dir="ltr">{o.date}</p>
        </div>
      ))}
    </div>
  );
}

function AddressesSection({
  addresses,
  setAddresses,
}: {
  addresses: Address[];
  setAddresses: (a: Address[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ label: "", line: "", city: "", postcode: "" });

  function handleAdd() {
    if (!form.line.trim()) return;
    const addr: Address = {
      id: `addr-${Date.now()}`,
      label: form.label.trim() || "المنزل",
      line: form.line.trim(),
      city: form.city.trim(),
      postcode: form.postcode.trim(),
    };
    setAddresses([...addresses, addr]);
    setForm({ label: "", line: "", city: "", postcode: "" });
    setAdding(false);
  }

  return (
    <div className="space-y-3">
      {addresses.map((a) => (
        <div key={a.id} className="card flex items-start justify-between gap-3 p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-gold-600">{a.label}</p>
            <p className="mt-1 text-sm text-ink">{a.line}</p>
            <p className="text-sm text-ink-muted">
              {a.city}{a.postcode ? ` ${a.postcode}` : ""}
            </p>
          </div>
          <button
            onClick={() => setAddresses(addresses.filter((x) => x.id !== a.id))}
            className="text-ink-faint hover:text-clay-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      {adding ? (
        <div className="card space-y-3 p-4">
          <input
            placeholder="التسمية (مثلاً: المنزل)"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-gold-400"
          />
          <input
            placeholder="العنوان"
            value={form.line}
            onChange={(e) => setForm({ ...form, line: e.target.value })}
            className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-gold-400"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="المدينة"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-gold-400"
            />
            <input
              placeholder="الرمز البريدي"
              value={form.postcode}
              onChange={(e) => setForm({ ...form, postcode: e.target.value })}
              className="w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2 text-sm outline-none focus:border-gold-400"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="btn-forest flex-1 py-2 text-sm">
              <Check className="h-4 w-4" /> حفظ
            </button>
            <button onClick={() => setAdding(false)} className="btn-outline flex-1 py-2 text-sm">
              <X className="h-4 w-4" /> إلغاء
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cream-300 py-4 text-sm font-bold text-ink-muted hover:border-gold-400 hover:text-gold-600"
        >
          <Plus className="h-4 w-4" /> إضافة عنوان جديد
        </button>
      )}
    </div>
  );
}

function PaymentSection() {
  const [cards, setCards] = useState<{ id: string }[]>([]);

  // Read after mount, not during render, to avoid a server/client hydration
  // mismatch (localStorage doesn't exist during server rendering).
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ariana_cards");
      if (raw) setCards(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="space-y-3">
      {cards.length === 0 && (
        <div className="grid place-items-center py-12 text-center">
          <CreditCard className="h-12 w-12 text-cream-400" />
          <p className="mt-3 text-sm text-ink-muted">
            لم تضِف أي طريقة دفع بعد. ستُحفظ بياناتك تلقائيًا عند إتمام أول طلب.
          </p>
        </div>
      )}

      <div className="card p-4 space-y-2">
        <h3 className="text-sm font-bold text-ink">طرق الدفع المتاحة</h3>
        <div className="space-y-2 text-sm text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cream-100">
              <CreditCard className="h-4 w-4 text-gold-500" />
            </span>
            بطاقة ائتمان / خصم
          </div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-cream-100">
              <span className="text-xs font-bold text-gold-500">$</span>
            </span>
            الدفع عند الاستلام
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationsSection({
  enabled,
  setEnabled,
}: {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      {[
        { label: "تحديثات الطلبات", desc: "إشعارات عند تغيّر حالة طلبك" },
        { label: "العروض والخصومات", desc: "كوني أول من يعلم بالعروض الحصرية" },
        { label: "وصل حديثًا", desc: "إشعارات عند إضافة قطع جديدة" },
      ].map((n) => (
        <div key={n.label} className="card flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-bold text-ink">{n.label}</p>
            <p className="text-xs text-ink-muted">{n.desc}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={`relative h-7 w-12 rounded-full transition ${
              enabled ? "bg-forest-500" : "bg-cream-300"
            }`}
          >
            <span
              className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                enabled ? "start-[1.375rem]" : "start-0.5"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

function SettingsSection({
  user,
  nameEdit,
  setNameEdit,
  editingName,
  setEditingName,
}: {
  user: { name: string; email: string };
  nameEdit: string;
  setNameEdit: (v: string) => void;
  editingName: boolean;
  setEditingName: (v: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-bold text-ink">معلومات الحساب</h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-muted">الاسم</p>
            {editingName ? (
              <input
                value={nameEdit}
                onChange={(e) => setNameEdit(e.target.value)}
                className="mt-1 rounded-lg border border-cream-300 bg-cream-50 px-2 py-1 text-sm outline-none focus:border-gold-400"
              />
            ) : (
              <p className="text-sm font-bold text-ink">{user.name}</p>
            )}
          </div>
          <button
            onClick={() => {
              if (editingName) {
                setEditingName(false);
              } else {
                setNameEdit(user.name);
                setEditingName(true);
              }
            }}
            className="text-xs font-bold text-clay-500"
          >
            {editingName ? "حفظ" : "تعديل"}
          </button>
        </div>

        <div>
          <p className="text-xs text-ink-muted">البريد الإلكتروني</p>
          <p className="text-sm font-bold text-ink" dir="ltr">{user.email}</p>
        </div>
      </div>

      <div className="card p-4 space-y-3">
        <h3 className="text-sm font-bold text-ink">التفضيلات</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">اللغة</span>
          <span className="text-sm font-bold text-ink">العربية</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">العملة</span>
          <span className="text-sm font-bold text-ink">AUD</span>
        </div>
      </div>
    </div>
  );
}
