import { Loader2, RotateCcw } from "lucide-react";
import { type ComponentProps } from "react";
import {
  usePagination,
  type PageData,
  type PageDataProvider,
} from "~/hooks/paginator";
import { cn } from "~/lib/utils";
import { Button } from "./ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { VerticalSeparator } from "./separator";

export function PagedCardGrid<Datatype>({
  className,
  dataProvider,
  cardComponent,
  controls,
  ...props
}: ComponentProps<"div"> & {
  dataProvider: PageDataProvider<Datatype>;
  cardComponent: (product: Datatype) => JSX.Element;
  controls?: (pageData: PageData<Datatype>) => JSX.Element | undefined;
}) {
  const { loading, reset, fetch, data, navigation } =
    usePagination(dataProvider);

  return (
    <div
      className={cn("flex h-full w-full flex-1 flex-row gap-4", className)}
      {...props}
    >
      <div className="flex flex-shrink-0 flex-grow-0 basis-64 flex-col gap-2">
        {controls?.(
          // some typing shenanigans
          data
            ? { loading, reset, fetch, data, navigation }
            : { loading, reset, fetch, data: null, navigation: null },
        )}
        {/* Fallback reset button */}
        {!controls && (
          <Button
            icon={
              loading ? <Loader2 className="animate-spin" /> : <RotateCcw />
            }
            onClick={() => reset()}
            disabled={loading}
          >
            Reset
          </Button>
        )}
      </div>
      <VerticalSeparator />
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
            <CardGrid items={data} cardComponent={cardComponent} />
          </>
        )}
      </div>
    </div>
  );
}

export function CardGrid<Datatype>({
  items,
  cardComponent,
}: {
  items: Datatype[] | null;
  cardComponent: (product: Datatype) => JSX.Element;
}) {
  if (items === null) {
    return <p>Start a search to begin</p>;
  }

  if (items.length === 0) {
    return <p>No results</p>;
  }

  return (
    <div className="grid flex-1 grid-cols-2 gap-4">
      {items.map((product) => cardComponent(product))}
    </div>
  );
}
