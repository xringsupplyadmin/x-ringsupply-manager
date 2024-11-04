import e from "@/dbschema/edgeql-js";
import { ProductEditor } from "~/components/ecommerce/product_editor";
import client from "~/server/db/client";

export default async function EditProductPage({
  params: { productId },
}: {
  params: { productId: string };
}) {
  const product = await e
    .select(e.ecommerce.Product, (p) => ({
      ...p["*"],
      filter_single: e.op(p.id, "=", e.uuid(productId)),
    }))
    .run(client);

  if (product === null) {
    return <h1 className="text-lg font-bold">Product not found</h1>;
  }

  return (
    <>
      <h1 className="text-lg font-bold">Edit Product {product.cfId}</h1>
      <ProductEditor product={product} />
    </>
  );
}
