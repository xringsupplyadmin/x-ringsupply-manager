"use client";

import { createEditorStore } from "~/stores/editor_store";

export default function EditProductPage({
  params: { productId },
}: {
  params: { productId: string };
}) {
  const useEditorStore = useCreateStore(createEditorStore);
  const cfId = Number.parseInt(productId);
  const test = useEditorStore();

  console.log("store:", test);

  return (
    <div>
      <h1 className="text-lg font-bold">Edit Product {productId}</h1>
    </div>
  );
}
