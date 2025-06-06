"use client";

import { MinusCircle, PlusCircle } from "lucide-react";
import { ProductCard } from "~/components/ecommerce/product";
import { Button } from "~/components/ui/button";
import type { ApiProduct } from "~/server/api/coreforce/types";
import {
  useSelectStore,
  useSelectStoreContext,
} from "~/stores/providers/select_store_provider";

export function KlaviyoSyncCard({ product }: { product: ApiProduct }) {
  const selected = useSelectStore((state) => state.selected);
  const selectedContext = useSelectStoreContext();

  const isSelected = selected.includes(product.cfId.toString());

  const controls = (
    <Button
      icon={isSelected ? <MinusCircle /> : <PlusCircle />}
      onClick={() => {
        if (isSelected) {
          selectedContext.setState((state) => {
            const newState = state.selected.filter(
              (id) => id !== product.cfId.toString(),
            );
            return { selected: newState };
          });
        } else {
          selectedContext.setState((state) => {
            const newState = [...state.selected, product.cfId.toString()];
            return { selected: newState };
          });
        }
      }}
    >
      {isSelected ? "Remove" : "Select"}
    </Button>
  );

  return (
    <ProductCard
      product={{
        ...product,
      }}
      footerControls={() => controls}
      minimal
    />
  );
}
