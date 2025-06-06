"use client";

import type { ecommerce } from "@/dbschema/interfaces";
import { Edit, Loader2, Plus, Search } from "lucide-react";
import Link from "next/link";
import React, {
  useCallback,
  useEffect,
  useState,
  type ComponentProps,
} from "react";
import { useToast } from "~/hooks/use-toast";
import type { ApiProduct, DbProduct } from "~/server/api/coreforce/types";
import { useFilterStore } from "~/stores/providers/filter_store_provider";
import { api } from "~/trpc/react";
import { PagedCardGrid } from "../paginator";
import { Button } from "../ui/button";
import { ProductCard } from "./product";
import type { PageData } from "~/hooks/paginator";
import { FilterSidebar } from "./filters";

export function ProductSearchControls({
  loading,
  reset,
  children,
  prependChildren = false,
}: PageData<unknown> & {
  children?: React.ReactNode;
  prependChildren?: boolean;
}) {
  return (
    <>
      {prependChildren && children}
      <Button
        icon={loading ? <Loader2 className="animate-spin" /> : <Search />}
        onClick={() => reset()}
        disabled={loading}
      >
        Search
      </Button>
      <FilterSidebar startSearch={reset} />
      {!prependChildren && children}
    </>
  );
}

export function ApiProductSearch(props: ComponentProps<"div">) {
  const trpc = api.useUtils();
  const filterValues = useFilterStore();
  const toast = useToast();
  const importAll = api.ecommerce.db.products.importAll.useMutation();
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
    <ImportProductCard product={product} key={product.cfId} />
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <Button
        onClick={() => {
          const importToast = toast.toast({
            title: "Importing products",
            description: "Please wait while products are being imported",
            variant: "default",
          });
          importAll.mutate(
            { filters: filterValues },
            {
              onSuccess(count) {
                toast.toast({
                  title: "Success!",
                  description: `${count} products imported`,
                });
              },
              onError(error) {
                toast.toast({
                  title: "Error importing products",
                  description: error.message,
                  variant: "destructive",
                });
              },
              onSettled() {
                importToast.dismiss();
              },
            },
          );
        }}
      >
        Import All
      </Button>
      <PagedCardGrid
        {...props}
        dataProvider={dataProvider}
        cardComponent={cardComponent}
        controls={ProductSearchControls}
      />
    </div>
  );
}

export function DbProductSearch(props: ComponentProps<"div">) {
  const trpc = api.useUtils();
  const filterValues = useFilterStore();
  const dataProvider = {
    getData: (pageData: { limit: number; offset: number } | undefined) =>
      trpc.ecommerce.db.products.search.fetch({
        filters: filterValues,
        pageData: pageData,
      }),
  };
  const cardComponent = (product: DbProduct) => (
    <DbProductCard product={product} key={product.id} />
  );

  return (
    <PagedCardGrid
      {...props}
      dataProvider={dataProvider}
      cardComponent={cardComponent}
      controls={ProductSearchControls}
    />
  );
}

function DbProductCard({ product }: { product: DbProduct }) {
  return (
    <ProductCard
      product={product}
      footerControls={(dbProduct) => (
        <Link href={`/src/app/admin/products/editor/${dbProduct.cfId}/edit`}>
          <Button size="icon" variant="ghost">
            <Edit />
          </Button>
        </Link>
      )}
    />
  );
}

function ImportProductCard({ product }: { product: ApiProduct }) {
  const trpc = api.useUtils();
  const importProduct = api.ecommerce.db.products.importProduct.useMutation();
  const { data: dbProduct, refetch: refetchDbProduct } =
    api.ecommerce.db.products.getById.useQuery({
      cfId: product.cfId,
    });

  const [categories, setCategories] =
    useState<Omit<ecommerce.Category, "department">[]>();
  const [tags, setTags] = useState<ecommerce.Tag[]>();
  const [manufacturer, setManufacturer] =
    useState<ecommerce.Manufacturer | null>();

  const updateTaxonomy = useCallback(async () => {
    const categories = await trpc.ecommerce.db.taxonomy.getCategories.fetch({
      cfIds: product.productCategoryIds,
    });
    setCategories(categories);
    const tags = await trpc.ecommerce.db.taxonomy.getTags.fetch({
      cfIds: product.productTagIds,
    });
    setTags(tags);

    if (product.productManufacturerId) {
      const manufacturer =
        await trpc.ecommerce.db.taxonomy.getManufacturer.fetch({
          cfId: product.productManufacturerId,
        });
      setManufacturer(manufacturer);
    } else {
      setManufacturer(null);
    }
  }, [
    trpc,
    product.productCategoryIds,
    product.productTagIds,
    product.productManufacturerId,
  ]);

  useEffect(() => {
    updateTaxonomy();
  }, [updateTaxonomy]);

  const dbId = dbProduct === undefined ? "..." : dbProduct?.id;

  const { toast } = useToast();

  return (
    <ProductCard
      product={{
        ...product,
        id: dbId,
        productCategories: categories,
        productTags: tags,
        productManufacturer: manufacturer,
      }}
      footerControls={() => (
        <div className="flex flex-row gap-2">
          <Button
            icon={
              importProduct.isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Plus />
              )
            }
            iconAlignEnd
            disabled={dbProduct === undefined || importProduct.isPending}
            onClick={async () => {
              importProduct.mutate(
                {
                  cfId: product.cfId,
                },
                {
                  onError: (error) => {
                    toast({
                      title: "Error Importing Product",
                      description: error.message,
                      variant: "destructive",
                    });
                  },
                  onSuccess: (data) => {
                    refetchDbProduct(); // Refetch the product to get the ID
                    toast({
                      title: "Product Imported Successfully!",
                      description: `Imported Product ID ${product.cfId} (${data.id})`,
                    });
                  },
                },
              );
            }}
          >
            {dbProduct?.id ? "Update" : "Import"}
          </Button>
          {dbProduct?.id && (
            <Link
              href={`/src/app/admin/products/editor/${dbProduct.cfId}/edit`}
            >
              <Button size="icon" variant="ghost">
                <Edit />
              </Button>
            </Link>
          )}
        </div>
      )}
    />
  );
}
