import { notFound } from "next/navigation";
import { Topbar } from "@/components/admin/Topbar";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);
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
