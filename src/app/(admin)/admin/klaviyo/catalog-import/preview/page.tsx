"use client";

import { RotateCcw, X } from "lucide-react";
import { PagedCardGrid } from "~/components/paginator";
import { Button } from "~/components/ui/button";
import {
  makeArrayDatasource,
  transformDatasource,
  type PageDataProvider,
} from "~/hooks/paginator";
import { useSingleShot } from "~/hooks/singleshot";
import type { ApiProduct } from "~/server/api/coreforce/types";
import {
  useSelectStore,
  useSelectStoreContext,
} from "~/stores/providers/select_store_provider";
import { api } from "~/trpc/react";
import { KlaviyoSyncCard } from "../_components";

export default function CatalogImportPage() {
  const trpc = api.useUtils();
  const selected = useSelectStore((state) => state.selected);
  const selectedContext = useSelectStoreContext();
  const trigger = useSingleShot(selected);

  const dataProvider = {
    getData: transformDatasource(makeArrayDatasource(selected), (slice) =>
      trpc.ecommerce.cfApi.products.getMany.fetch({
        product_ids: slice.map((id) => Number.parseInt(id)),
      }),
    ),
    trigger,
  } satisfies PageDataProvider<ApiProduct>;
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
            <>
              <p className="text-center">
                Selected: {selected.length} products
              </p>
              <Button icon={<RotateCcw />} onClick={() => pageData.fetch()}>
                Refresh
              </Button>
              <Button
                icon={<X />}
                onClick={() => {
                  selectedContext.setState(() => ({ selected: [] }));
                  pageData.reset();
                }}
              >
                Reset Selection
              </Button>
            </>
          );
        }}
      />
    </div>
  );
}
