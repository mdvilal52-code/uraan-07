import { Topbar } from "@/components/admin/Topbar";
import { ProductForm } from "@/components/admin/ProductForm";

export default function AddProductPage() {
  return (
    <>
      <Topbar title="Add Product" />
      <div className="p-4 sm:p-6">
        <ProductForm />
      </div>
    </>
  );
}
