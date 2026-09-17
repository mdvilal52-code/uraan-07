import { Star } from "lucide-react";
import { Topbar } from "@/components/admin/Topbar";

// There is no customer-facing review submission anywhere on the storefront
// yet (product "rating"/"reviews" are admin-set catalogue numbers, not
// individual written reviews) — so there is nothing real to moderate here.
// This page previously showed fabricated sample reviews with Approve/Delete
// buttons that didn't do anything; showing an honest empty state instead of
// fake data + dead controls until review submission actually exists.
export default function AdminReviewsPage() {
  return (
    <>
      <Topbar title="Reviews" />
      <div className="space-y-4 p-4 sm:p-6">
        <p className="text-sm text-ink-muted">Review and manage customer feedback</p>
        <div className="card grid place-items-center py-16 text-center text-ink-muted">
          <Star className="h-8 w-8 text-cream-400" />
          <p className="mt-3 text-sm">
            No customer reviews yet — this page will populate once shoppers
            can leave reviews on products.
          </p>
        </div>
      </div>
    </>
  );
}
