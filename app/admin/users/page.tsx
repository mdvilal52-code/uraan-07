import { Plus, Shield, Trash2 } from "lucide-react";
import { Topbar } from "@/components/admin/Topbar";

const users = [
  { name: "Ahmed Al Hashimi", email: "ahmed@ariana.example", role: "Super Admin", roleCls: "bg-gold-100 text-gold-700" },
  { name: "Laila Al Amri", email: "laila@ariana.example", role: "Store Manager", roleCls: "bg-forest-50 text-forest-600" },
  { name: "Khaled Al Marzouqi", email: "khaled@ariana.example", role: "Content Editor", roleCls: "bg-blue-100 text-blue-700" },
  { name: "Fatima Al Zaabi", email: "fatima@ariana.example", role: "Customer Support", roleCls: "bg-cream-200 text-ink-soft" },
];

export default function AdminUsersPage() {
  return (
    <>
      <Topbar title="Users" />
      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-muted">Manage your team and permissions</p>
          <button className="btn-forest">
            <Plus className="h-4 w-4" />
            New User
          </button>
        </div>

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
                {users.map((u) => (
                  <tr
                    key={u.email}
                    className="border-b border-cream-100 text-sm last:border-0 hover:bg-cream-100/60"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-gradient font-sans text-sm font-extrabold text-forest-800">
                          {u.name.charAt(0)}
                        </span>
                        <div>
                          <p className="font-sans font-semibold text-ink">{u.name}</p>
                          <p className="text-[0.7rem] text-ink-faint">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-bold ${u.roleCls}`}>
                        <Shield className="h-3 w-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button aria-label="Delete" className="grid h-8 w-8 place-items-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
