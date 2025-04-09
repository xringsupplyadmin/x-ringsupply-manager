import { ProductEditor } from "~/components/ecommerce/product_editor";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const cfId = Number.parseInt(productId);

  return (
    <>
      <h1 className="text-lg font-bold">Edit Product {productId}</h1>
      <ProductEditor productCfId={cfId} />
    </>
  );
}
