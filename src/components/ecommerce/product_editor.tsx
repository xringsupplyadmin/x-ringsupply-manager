"use client";

import type React from "react";
import { useCallback, useState } from "react";
import { useToast } from "~/hooks/use-toast";
import { cn } from "~/lib/utils";
import type { ApiProduct } from "~/server/api/coreforce/types";
import { useEditorStore } from "~/stores/providers/editor_store_provider";
import { api } from "~/trpc/react";
import { ProductImage } from "./product";
import { Input } from "../ui/input";

type ApiMismatch =
  | {
      mismatch: true;
      diff: string;
    }
  | {
      mismatch: false;
    };

export function ProductEditor({
  product,
  className,
  ...props
}: { product: ApiProduct } & React.HTMLAttributes<HTMLDivElement>) {
  const { toast } = useToast();
  const { data: apiProduct } = api.ecommerce.cfApi.products.get.useQuery({
    product_id: product.cfId,
  });
  const edits = useEditorStore((state) => state.edits[product.cfId]);
  const [shownOutdatedWarning, setShownOutdatedWarning] = useState(false);

  const getFieldDisplayValue = useCallback(
    <Field extends keyof ApiProduct>(field: Field): ApiProduct[Field] => {
      if (edits && edits[field] !== undefined) {
        const editValue = edits[field];
        if (editValue !== undefined) {
          return editValue as ApiProduct[Field]; // Cast to the correct type
        }
      }

      return product[field];
    },
    [product, edits],
  );

  const apiMismatch = useCallback(
    <Field extends keyof ApiProduct>(field: Field): ApiMismatch => {
      if (!apiProduct) {
        return {
          mismatch: false,
        };
      }

      const apiValue = apiProduct[field];
      const editValue = edits?.[field];

      if (apiValue === editValue) {
        return {
          mismatch: false,
        };
      } else {
        return {
          mismatch: true,
          diff: "", // TODO implement diff
        };
      }
    },
    [apiProduct, product],
  );

  if (
    !shownOutdatedWarning &&
    apiProduct &&
    product.timeChanged < apiProduct.timeChanged
  ) {
    setShownOutdatedWarning(true);
    toast({
      title: "Local data outdated",
      description:
        "Consider resyncing this product to avoid overwriting changes in the system",
      variant: "destructive",
    });
  }

  return (
    <div
      className={cn(className, "flex w-full flex-col items-center")}
      {...props}
    >
      <ProductImage
        description={product.description}
        imageId={product.imageId}
        imageUrls={product.imageUrls}
        className="max-h-24 max-w-40 flex-auto object-contain"
      />
      <label className="text-sm font-semibold">Code</label>
      <Input defaultValue={getFieldDisplayValue("code")} />
      <label className="text-sm font-semibold">Description</label>
      <Input defaultValue={getFieldDisplayValue("description")} />
      <label className="text-sm font-semibold">Detailed Description</label>
    </div>
  );
}
