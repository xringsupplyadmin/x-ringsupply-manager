"use client";

import { ProductSearchControls } from "~/components/ecommerce/product_search";
import { PagedCardGrid } from "~/components/paginator";
import type { ApiProduct } from "~/server/api/coreforce/types";
import { useFilterStore } from "~/stores/providers/filter_store_provider";
import { useSelectStore } from "~/stores/providers/select_store_provider";
import { api } from "~/trpc/react";
import { KlaviyoSyncCard } from "./_components";

export default function CatalogImportPage() {
  const trpc = api.useUtils();
  const filterValues = useFilterStore();
  const selected = useSelectStore((state) => state.selected);

  const dataProvider = {
    getData: (pageData: { limit: number; offset: number } | undefined) =>
      trpc.ecommerce.cfApi.products.search.fetch({
        filters: filterValues,
        pageData: pageData,
      }),
    getCountAsync: () =>
      trpc.ecommerce.cfApi.products.count.fetch({ filters: filterValues }),
  };
  const cardComponent = (product: ApiProduct) => (
    <KlaviyoSyncCard product={product} key={product.cfId} />
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <PagedCardGrid
        dataProvider={dataProvider}
        cardComponent={cardComponent}
        controls={(pageData) => {
          return (
            <ProductSearchControls {...pageData} prependChildren>
              <p className="text-center">
                Selected: {selected.length} products
              </p>
            </ProductSearchControls>
          );
        }}
      />
    </div>
  );
}
