"use client";

import { ExternalLink, RotateCcw, Trash2, X } from "lucide-react";
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
import { api, withToastStatus } from "~/trpc/react";
import { KlaviyoSyncCard } from "../_components";
import { useToast } from "~/hooks/use-toast";
import { HorizontalSeparator } from "~/components/separator";

export default function CatalogImportPage() {
  const toast = useToast();
  const trpc = api.useUtils();
  const selected = useSelectStore((state) => state.selected);
  const selectedContext = useSelectStoreContext();
  const trigger = useSingleShot(selected);
  const { mutate: syncProducts, isPending: syncPending } =
    api.v2.klaviyo.catalog.sync.products.useMutation(
      withToastStatus(toast, {
        description: "Syncing Klaviyo Products",
        successMsg: ({ created, updated, failed }) => [
          `Created ${created} products`,
          `Updated ${updated} products`,
          failed.length > 0
            ? `Failed to import ${failed.length} products`
            : "All products imported",
        ],
      }),
    );
  const { mutate: deleteProducts, isPending: deletePending } =
    api.v2.klaviyo.catalog.delete.products.useMutation(
      withToastStatus(toast, {
        description: "Deleting Klaviyo Products",
        successMsg: ({ deleted, failed }) => [
          `Deleted ${deleted} products`,
          failed.length > 0
            ? `Failed to delete ${failed.length} products`
            : "All products deleted",
        ],
      }),
    );

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
              <Button
                icon={<ExternalLink />}
                pending={syncPending}
                onClick={() =>
                  syncProducts({
                    ids: selected.map((id) => Number.parseInt(id)),
                  })
                }
                title="Sync selected products to Klaviyo"
              >
                Import Selected
              </Button>
              <Button
                icon={<Trash2 />}
                pending={deletePending}
                onClick={() =>
                  deleteProducts({
                    ids: selected.map((id) => Number.parseInt(id)),
                  })
                }
                title="Remove selected products from Klaviyo"
              >
                Remove Selected
              </Button>
              <HorizontalSeparator />
              <Button icon={<RotateCcw />} onClick={() => pageData.fetch()}>
                Refresh Selection
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
