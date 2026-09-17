"use client";

import { useEffect, useState } from "react";
import { Shield, Trash2, Loader2, Users as UsersIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  createdAt: string;
}

const roleCls: Record<AdminUserRow["role"], string> = {
  admin: "bg-gold-100 text-gold-700",
  customer: "bg-cream-200 text-ink-soft",
};

export function UsersTable() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = () =>
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .catch(() => setUsers([]));

  useEffect(() => {
    load();
  }, []);

  async function toggleRole(u: AdminUserRow) {
    const nextRole = u.role === "admin" ? "customer" : "admin";
    setError("");
    setBusy(u.id);
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: nextRole }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Unable to update this user");
      setBusy(null);
      return;
    }
    await load();
    setBusy(null);
  }

  async function remove(u: AdminUserRow) {
    if (!confirm(`Delete the account for ${u.name || u.email}?`)) return;
    setError("");
    setBusy(u.id);
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Unable to delete this user");
      setBusy(null);
      return;
    }
    await load();
    setBusy(null);
  }

  if (!users) {
    return (
      <div className="card grid place-items-center py-16 text-ink-muted">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      {users.length === 0 ? (
        <div className="card grid place-items-center py-16 text-center text-ink-muted">
          <UsersIcon className="h-8 w-8 text-cream-400" />
          <p className="mt-3 text-sm">No registered accounts yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead>
                <tr className="border-b border-cream-200 text-xs font-bold text-ink-muted">
                  <th className="px-4 py-3 text-start">User</th>
                  <th className="px-4 py-3 text-start">Role</th>
                  <th className="px-4 py-3 text-start"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === me?.id;
                  return (
                    <tr
                      key={u.id}
                      className={`border-b border-cream-100 text-sm last:border-0 hover:bg-cream-100/60 ${busy === u.id ? "opacity-50" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-gradient font-sans text-sm font-extrabold text-forest-800">
                            {(u.name || u.email).charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-sans font-semibold text-ink">
                              {u.name}
                              {isSelf && (
                                <span className="ml-1.5 text-[0.65rem] font-bold text-ink-faint">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="text-[0.7rem] text-ink-faint">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={isSelf || busy === u.id}
                          onClick={() => toggleRole(u)}
                          title={isSelf ? "You can't change your own role" : `Make ${u.role === "admin" ? "customer" : "admin"}`}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold transition disabled:cursor-not-allowed disabled:opacity-70 ${roleCls[u.role]} ${isSelf ? "" : "hover:opacity-80"}`}
                        >
                          <Shield className="h-3 w-3" />
                          {u.role === "admin" ? "Admin" : "Customer"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => remove(u)}
                          disabled={isSelf || busy === u.id}
                          aria-label="Delete"
                          title={isSelf ? "You can't delete your own account" : "Delete user"}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
