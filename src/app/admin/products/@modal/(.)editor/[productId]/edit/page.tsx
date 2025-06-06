import { DialogProductEditor } from "~/components/ecommerce/product_editor";

export default async function ModalEditorPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const cfId = Number.parseInt(productId);

  return <DialogProductEditor productCfId={cfId} backOnClose={true} />;
}
