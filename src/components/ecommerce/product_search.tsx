"use client";

import type { ecommerce } from "@/dbschema/interfaces";
import { Edit, Loader2, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useState, type ComponentProps } from "react";
import { usePagination, type PageDataProvider } from "~/hooks/paginator";
import { useToast } from "~/hooks/use-toast";
import { cn } from "~/lib/utils";
import type { ApiProduct, DbProduct } from "~/server/api/coreforce/types";
import { useFilterStore } from "~/stores/providers/filter_store_provider";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { FilterSidebar } from "./filters";
import { ProductCard } from "./product";
import Link from "next/link";

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
    <div className="flex flex-1 flex-col gap-4">
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
      <ProductSearchGrid
        {...props}
        dataProvider={dataProvider}
        cardComponent={cardComponent}
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
    <ProductSearchGrid
      {...props}
      dataProvider={dataProvider}
      cardComponent={cardComponent}
    />
  );
}

function ProductSearchGrid<Datatype>({
  className,
  dataProvider,
  cardComponent,
  ...props
}: ComponentProps<"div"> & {
  dataProvider: PageDataProvider<Datatype>;
  cardComponent: (product: Datatype) => JSX.Element;
}) {
  const {
    loading,
    reset: newSearch,
    data,
    navigation,
  } = usePagination(dataProvider);

  return (
    <div
      className={cn("flex h-full w-full flex-1 flex-row gap-4", className)}
      {...props}
    >
      <div className="flex flex-shrink-0 flex-grow-0 basis-64 flex-col gap-2">
        <Button
          icon={loading ? <Loader2 className="animate-spin" /> : <Search />}
          onClick={() => newSearch()}
          disabled={loading}
        >
          Search
        </Button>
        <FilterSidebar />
      </div>
      {/* Spacer Element */}
      <div className="min-h-full basis-1 rounded bg-accent/50" />
      <div className="flex w-full flex-col gap-4 text-center">
        {loading ? (
          <p className="flex flex-row justify-center gap-2">
            <Loader2 className="animate-spin" /> Loading...
          </p>
        ) : (
          <>
            {data && data.length > 0 && (
              <p className="col-span-full text-center">
                Displaying {navigation.meta.firstItem} -{" "}
                {navigation.meta.lastItem} of {navigation.meta.itemCount}
                {navigation.meta.totalUnknown ? "+" : ""} results
              </p>
            )}
            {navigation && (
              <Pagination className="justify-between">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      disabled={navigation.prevPage === undefined}
                      onClick={() => navigation.prevPage?.()}
                    />
                  </PaginationItem>
                </PaginationContent>
                <PaginationContent>
                  {navigation.firstPage > 0 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  {new Array(navigation.lastPage - navigation.firstPage + 1)
                    .fill(0)
                    .map((_, i) => (
                      <PaginationItem key={i + navigation.firstPage}>
                        <PaginationLink
                          href="#"
                          isActive={
                            navigation.currentPage === i + navigation.firstPage
                          }
                          onClick={() =>
                            navigation.selectPage(i + navigation.firstPage)
                          }
                        >
                          {i + navigation.firstPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  {navigation.lastPage < navigation.maxPage && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </PaginationContent>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      disabled={navigation.nextPage === undefined}
                      onClick={() => navigation.nextPage?.()}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
            <ProductGrid products={data} cardComponent={cardComponent} />
          </>
        )}
      </div>
    </div>
  );
}

function ProductGrid<Datatype>({
  products,
  cardComponent,
}: {
  products: Datatype[] | null;
  cardComponent: (product: Datatype) => JSX.Element;
}) {
  if (products === null) {
    return <p>Start a search to begin</p>;
  }

  if (products.length === 0) {
    return <p>No results</p>;
  }

  return (
    <div className="grid flex-1 grid-cols-2 gap-4">
      {products.map((product) => cardComponent(product))}
    </div>
  );
}

function DbProductCard({ product }: { product: DbProduct }) {
  return (
    <ProductCard
      product={product}
      footerControls={(dbProduct) => (
        <Link href={`/admin/products/editor/${dbProduct.id}/edit`}>
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
            <Link href={`/admin/products/editor/${dbProduct.id}/edit`}>
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
