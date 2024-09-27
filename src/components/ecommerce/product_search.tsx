"use client";

import { Loader2, Search } from "lucide-react";
import { useEffect, useState, type ComponentProps } from "react";
import { apiSearchProductAction } from "~/lib/actions";
import { useFilterStore, type FilterStore } from "~/lib/stores";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import { ImportProductCard, type ImportProduct } from "./product";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

export function ApiProductSearch(
  props: ComponentProps<"div"> & {
    filterSidebar: JSX.Element;
  },
) {
  return (
    <ProductSearchGrid
      searchFn={(filters, limit, offset) =>
        apiSearchProductAction(filters, {
          limit,
          offset,
        })
      }
      {...props}
    />
  );
}

function ProductSearchGrid({
  className,
  filterSidebar,
  searchFn,
  ...props
}: ComponentProps<"div"> & {
  filterSidebar: JSX.Element;
  searchFn: (
    filters: FilterStore,
    limit: number,
    offset: number,
  ) => Promise<{
    products: ImportProduct[];
    hasNextPage: boolean;
    totalCount?: number;
  }>;
}) {
  const [products, setProducts] = useState<ImportProduct[]>([]);
  const [totalCount, setTotalCount] = useState<number | undefined>(0);

  const [searching, setSearching] = useState(false);

  // Pagination
  const pageSize = 20;
  const pagesPerQuery = 3;

  const [hasNextQuery, setHasNextQuery] = useState(false);
  const [page, setPage] = useState(0);
  const displayStartIndex = (page % pagesPerQuery) * pageSize;
  const displayEndIndex = Math.min(
    displayStartIndex + pageSize,
    products.length,
  );
  const maxPage = totalCount
    ? Math.ceil(totalCount / pageSize)
    : hasNextQuery
      ? page + pagesPerQuery - (page % pagesPerQuery) + 1
      : page -
        (page % pagesPerQuery) -
        1 +
        Math.ceil(products.length / pageSize);
  const paginationStart = Math.max(0, page - 3);
  const paginationEnd = Math.min(maxPage, page + 3);
  const pageRange = new Array(paginationEnd - paginationStart + 1)
    .fill(0)
    .map((_, i) => i + paginationStart);
  const hasPrevPage = page > 0;
  const hasNextPage = page < maxPage;

  console.log(maxPage, page, paginationStart, paginationEnd, pageRange);

  const filterValues = useFilterStore();

  const doSearch = async (searchPage: number) => {
    setSearching(true);
    const results = await searchFn(
      filterValues,
      pagesPerQuery * pageSize,
      pagesPerQuery * pageSize * searchPage,
    );
    setHasNextQuery(results.hasNextPage);
    setTotalCount(results.totalCount);
    setProducts(results.products);
    setSearching(false);
  };

  const newSearch = async () => {
    await doSearch(0);
    setPage(0);
  };

  const switchPage = async (newPage: number) => {
    if (newPage < 0 || newPage > maxPage) return;
    const queryPage = Math.floor(newPage / pagesPerQuery);
    const oldQueryPage = Math.floor(page / pagesPerQuery);
    setPage(newPage);
    if (queryPage === oldQueryPage) return;
    await doSearch(queryPage);
  };

  return (
    <div
      className={cn("flex h-full w-full flex-1 flex-row gap-4", className)}
      {...props}
    >
      <div className="flex basis-48 flex-col gap-4">
        <Button
          icon={searching ? <Loader2 className="animate-spin" /> : <Search />}
          onClick={async () => await newSearch()}
          disabled={searching}
        >
          Search
        </Button>
        {filterSidebar}
      </div>
      <div className="min-h-full basis-1 rounded bg-accent/50" />
      <div className="flex w-full flex-col gap-4 text-center">
        {searching ? (
          <p className="flex flex-row justify-center gap-2">
            <Loader2 className="animate-spin" /> Searching...
          </p>
        ) : (
          <>
            {products.length > 0 && (
              <p className="col-span-full text-center">
                Displaying {page * pageSize + 1} -{" "}
                {page * pageSize + (displayEndIndex % pageSize)} of{" "}
                {totalCount ??
                  `${page * pageSize + products.length - displayStartIndex}${hasNextQuery ? "+" : ""}`}{" "}
                results
              </p>
            )}
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    disabled={!hasPrevPage}
                    onClick={() => switchPage(page - 1)}
                  />
                </PaginationItem>
                {paginationStart > 0 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                {pageRange.map((num) => (
                  <PaginationItem key={num}>
                    <PaginationLink
                      href="#"
                      isActive={num === page}
                      onClick={() => switchPage(num)}
                    >
                      {num + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {paginationEnd < maxPage && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    disabled={!hasNextPage}
                    onClick={() => switchPage(page + 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <ProductGrid
              products={products.slice(displayStartIndex, displayEndIndex)}
            />
          </>
        )}
      </div>
    </div>
  );
}

function ProductGrid({ products }: { products: ImportProduct[] }) {
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
