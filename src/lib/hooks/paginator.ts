"use client";

import { useCallback, useEffect, useState } from "react";

type PaginationData<Data> = {
  data: Data[];
  hasNextPage: boolean;
  totalCount?: number;
};

/**
 * The provider function should only return null if the source is not initialized
 */
type Datasource<
  Data,
  Output extends PaginationData<Data> = PaginationData<Data>,
> = (pageData?: { limit: number; offset: number }) => Promise<Output | null>;

type PageData<Datatype> = {
  loading: boolean;
  reset: () => void;
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
        page: number;
        nextPage?: () => void | undefined;
        prevPage?: () => void | undefined;
        selectPage: (page: number) => void;
      };
    }
);

export function usePagination<Datatype>({
  dataProvider,
  countProvider,
  itemsPerPage = 20,
  pagesPerQuery = 3,
}: {
  dataProvider: Datasource<Datatype>;
  countProvider?: () => Promise<number>;
  itemsPerPage?: number;
  pagesPerQuery?: number;
}): PageData<Datatype> {
  const [data, setData] = useState<Datatype[] | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [queryPage, setQueryPage] = useState(0);
  const querySubPage = page % pagesPerQuery;
  const [hasNextQuery, setHasNextQuery] = useState(false);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);

  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    async (page: number) => {
      const result = await dataProvider({
        limit: itemsPerPage * pagesPerQuery,
        offset: page * itemsPerPage * pagesPerQuery,
      });

      if (!result) return;

      setData(result.data);
      setHasNextQuery(result.hasNextPage);
      // Always set the total count when its not set or when there is no additional count provider
      if (totalCount === undefined || !countProvider) {
        setTotalCount(result.totalCount);
      }
      // if (countProvider) {
      //   // Depending on implementation this may take a long time so run it async
      //   countProvider().then((count) => {
      //     setTotalCount(count);
      //     setHasNextQuery(false);
      // });
      // }
    },
    [itemsPerPage, pagesPerQuery],
  );

  useEffect(() => {
    fetchData(queryPage);
  }, [fetchData, queryPage]);

  useEffect(() => {
    setLoading(false);
  }, [data]);

  const reset = () => {
    setPage(0);
    setQueryPage(0);
  };

  const basePageData = {
    loading: loading,
    reset: reset,
  };

  if (!loading && data) {
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
      const newQueryPage =
        (newPage - (newPage % pagesPerQuery)) / pagesPerQuery;

      // Fetch the data if a new query is required
      if (queryPage !== newQueryPage) {
        setQueryPage(newQueryPage);
        setLoading(true);
      }
    };
    const nextPage = page < maxPage ? () => selectPage(page + 1) : undefined;
    const prevPage = page > 0 ? () => selectPage(page - 1) : undefined;

    return {
      ...basePageData,
      data: loading ? [] : (data ?? []).slice(startIndex, endIndex),
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
        page: page,
        nextPage: nextPage,
        prevPage: prevPage,
        selectPage: selectPage,
      },
    };
  } else {
    return {
      ...basePageData,
      data: null,
      navigation: null,
    };
  }
}
