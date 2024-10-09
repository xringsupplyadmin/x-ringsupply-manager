"use client";

import { Loader2, Search } from "lucide-react";
import { useCallback, useState, type ComponentProps } from "react";
import { apiProductCountAction, apiSearchProductAction } from "~/lib/actions";
import { usePagination } from "~/lib/hooks/paginator";
import { useFilterStore, type FilterStore } from "~/lib/stores";
import { cn } from "~/lib/utils";
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
import { ImportProductCard, type ImportProduct } from "./product";

export function ApiProductSearch(
  props: ComponentProps<"div"> & {
    filterSidebar: JSX.Element;
  },
) {
  return <ProductSearchGrid {...props} />;
}

function ProductSearchGrid({
  className,
  filterSidebar,
  ...props
}: ComponentProps<"div"> & {
  filterSidebar: JSX.Element;
}) {
  const filterValues = useFilterStore();
  // const [searchValue, setSearchValue] = useState<FilterStore>();
  const { loading, reset, data, navigation } = usePagination({
    dataProvider: () => apiSearchProductAction(filterValues),
    countProvider: () => apiProductCountAction(filterValues),
  });

  const newSearch = useCallback(
    () => reset(), //setSearchValue(filterValues),
    [filterValues],
  );

  console.log("navigation", navigation);

  return (
    <div
      className={cn("flex h-full w-full flex-1 flex-row gap-4", className)}
      {...props}
    >
      <div className="flex basis-48 flex-col gap-4">
        <Button
          icon={loading ? <Loader2 className="animate-spin" /> : <Search />}
          onClick={() => newSearch()}
          disabled={loading}
        >
          Search
        </Button>
        {filterSidebar}
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
                            navigation.page === i + navigation.firstPage
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
            <ProductGrid products={data} />
          </>
        )}
      </div>
    </div>
  );
}

function ProductGrid({ products }: { products: ImportProduct[] | null }) {
  if (products === null) {
    return <p>Start a search to begin</p>;
  }

  if (products.length === 0) {
    return <p>No results</p>;
  }

  return (
    <div className="grid flex-1 grid-cols-2 gap-4">
      {products.map((product) => (
        <ImportProductCard key={product.cfId} product={product} />
      ))}
    </div>
  );
}
