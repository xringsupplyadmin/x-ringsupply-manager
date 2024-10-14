"use client";

import { useEditorStore } from "~/stores/providers/editor_store_provider";

export default function EditProductPage({
  params: { productId },
}: {
  params: { productId: string };
}) {
  const cfId = Number.parseInt(productId);
  const test = useEditorStore();

  console.log("store:", test);

  return (
    <div>
      <h1 className="text-lg font-bold">Edit Product {productId}</h1>
    </div>
  );
}
