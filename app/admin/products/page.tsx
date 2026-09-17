import Link from "next/link";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/admin/Topbar";
import { ProductTable } from "@/components/admin/ProductTable";

export default function AdminProductsPage() {
  return (
    <>
      <Topbar title="Products" />
      <div className="space-y-5 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-muted">Manage the product catalogue</p>
          <Link href="/admin/products/add" className="btn-forest">
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
        <ProductTable />
      </div>
    </>
  );
}
