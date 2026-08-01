import { notFound } from "next/navigation";
import { Topbar } from "@/components/admin/Topbar";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductById, getProductIds } from "@/lib/products";

export function generateStaticParams() {
  return getProductIds().map((id) => ({ id }));
}

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = getProductById(params.id);
  if (!product) notFound();

  return (
    <>
      <Topbar title="تعديل المنتج" />
      <div className="p-4 sm:p-6">
        <ProductForm product={product} />
      </div>
    </>
  );
}
