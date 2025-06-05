"use client";

import { useCallback, useEffect, useState } from "react";

export type PaginationData<Data> = {
  data: Data[];
  hasNextPage: boolean;
  totalCount?: number;
};

/**
 * The provider function should only return null if the source is not initialized
 */
export type Datasource<
  Data,
  Output extends PaginationData<Data> = PaginationData<Data>,
> = (pageData?: { limit: number; offset: number }) => Promise<Output | null>;

export type PageData<Datatype> = {
  loading: boolean;
  reset: () => void;
  fetch: () => void;
} & (
  | {
      data: null;
      navigation: null;
    }
  | {
      data: Datatype[];
      navigation: {
        meta: {
          firstItem: number;
          lastItem: number;
          itemCount: number;
          totalUnknown: boolean;
        };
        firstPage: number;
        lastPage: number;
        maxPage: number;
        currentPage: number;
        nextPage?: () => void | undefined;
        prevPage?: () => void | undefined;
        selectPage: (page: number) => void;
      };
    }
);

export type PageDataProvider<Datatype> = {
  /**
   * The function that fetches the data for the current page
   */
  getData: Datasource<Datatype>;
  /**
   * Only needed if `getData` doesn't return a total count
   * @returns The total count of items in the dataset
   */
  getCountAsync?: () => Promise<number>;
  /**
   * A stateful variable
   * Data will be refetched when changed
   */
  trigger?: unknown;
};

export type PageProps = {
  itemsPerPage?: number;
  pagesPerQuery?: number;
};

export function makeArrayDatasource<Datatype>(
  array: Datatype[],
): Datasource<Datatype> {
  return async (pageData?: { limit: number; offset: number }) => ({
    data: array.slice(
      pageData?.offset ?? 0,
      pageData ? pageData.offset + pageData.limit : undefined,
    ),
    hasNextPage: false,
    totalCount: array.length,
  });
}

export function transformDatasource<Datatype, Transformed>(
  dataProvider: Datasource<Datatype>,
  transform: (data: Datatype[]) => Promise<Transformed>,
) {
  return async (pageData?: { limit: number; offset: number }) => {
    const data = await dataProvider(pageData);
    return data
      ? {
          data: await transform(data.data),
          hasNextPage: data.hasNextPage,
          totalCount: data.totalCount,
        }
      : null;
  };
}

export function usePagination<Datatype>({
  getData: dataProvider,
  getCountAsync: countProviderAsync,
  trigger,
  itemsPerPage = 20,
  pagesPerQuery = 3,
}: PageDataProvider<Datatype> & PageProps): PageData<Datatype> {
  // Query data
  const [data, setData] = useState<Datatype[] | undefined>(undefined);
  const [hasNextQuery, setHasNextQuery] = useState(false);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  const [doFetch, setDoFetch] = useState(false);

  useEffect(() => {
    setDoFetch(true);
  }, [trigger]);

  // Page data
  const [page, setPage] = useState(0);
  const [queryPage, setQueryPage] = useState(0);
  const querySubPage = page % pagesPerQuery;
  const reset = useCallback(() => {
    // Reset the page
    setPage(0);
    setQueryPage(0);
    // Reset the data
    setData(undefined);
    setHasNextQuery(false);
    setTotalCount(undefined);
    // Initiate a new fetch
    setDoFetch(true);
  }, []);

  // State data
  const [loading, setLoading] = useState(false);

  // Query function
  const fetchData = useCallback(
    async (page: number) => {
      const result = await dataProvider({
        limit: itemsPerPage * pagesPerQuery,
        offset: page * itemsPerPage * pagesPerQuery,
      });

      if (!result) return;

      setData(result.data);
      // Always set the total count when its not set or when there is no async count provider
      if (totalCount === undefined || !countProviderAsync) {
        setTotalCount(result.totalCount);
        setHasNextQuery(result.hasNextPage);
      }

      // If we have an async provider, use it to get the total count
      if (countProviderAsync) {
        countProviderAsync()
          .then((count) => {
            setTotalCount(count);
            setHasNextQuery(false);
          })
          .catch((reason) => {
            console.error("Failed to fetch total count", reason);
          });
      }
    },
    [dataProvider, countProviderAsync, itemsPerPage, pagesPerQuery, totalCount],
  );

  // Fetch the data when needed
  if (doFetch) {
    setLoading(true);
    fetchData(queryPage).finally(() => setLoading(false));
    setDoFetch(false);
  }

  // Build the response
  const basePageData = {
    loading: loading,
    reset: reset,
    fetch: () => setDoFetch(true),
  };

  // Return a null response if the data is still loading or not available
  if (loading || !data) {
    return {
      ...basePageData,
      data: null,
      navigation: null,
    };
  }

  // Calculate the page range and item count
  let maxPage;
  let itemCount;
  if (totalCount) {
    // The number of pages to display all items
    maxPage = Math.floor(totalCount / itemsPerPage);
    itemCount = totalCount;
  } else if (hasNextQuery) {
    // We know we have at least one more query of pages
    maxPage = page - querySubPage + pagesPerQuery;
    itemCount = maxPage * itemsPerPage;
  } else {
    // Just guess
    maxPage = page - querySubPage + Math.floor(data.length / itemsPerPage);
    itemCount = (page - querySubPage) * itemsPerPage + data.length;
  }

  const startIndex = (page % pagesPerQuery) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, data.length);

  // Page control functions
  const selectPage = (newPage: number) => {
    // limit the page range
    if (newPage < 0 || newPage > maxPage) return;

    // Update page state
    setPage(newPage);
    const newQueryPage = (newPage - (newPage % pagesPerQuery)) / pagesPerQuery;

    // Fetch the data if a new query is required
    if (queryPage !== newQueryPage) {
      setQueryPage(newQueryPage);
      setDoFetch(true);
    }
  };
  const nextPage = page < maxPage ? () => selectPage(page + 1) : undefined;
  const prevPage = page > 0 ? () => selectPage(page - 1) : undefined;

  return {
    ...basePageData,
    data: data.slice(startIndex, endIndex),
    navigation: {
      meta: {
        firstItem: (page - querySubPage) * itemsPerPage + startIndex + 1,
        lastItem: (page - querySubPage) * itemsPerPage + endIndex,
        itemCount: itemCount,
        totalUnknown: !totalCount && hasNextQuery,
      },
      firstPage: Math.max(0, page - 3),
      lastPage: Math.min(maxPage, page + 3),
      maxPage: maxPage,
      currentPage: page,
      nextPage: nextPage,
      prevPage: prevPage,
      selectPage: selectPage,
    },
  };
}
