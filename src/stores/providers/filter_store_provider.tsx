"use client";

import React, { createContext, useContext, useRef } from "react";
import { createFilterStore, type FilterStore } from "../filter_store";

export type FilterStoreApi = ReturnType<typeof createFilterStore>;

export const FilterStoreContext = createContext<FilterStoreApi | undefined>(
  undefined,
);

export const FilterStoreProvider = ({
  children,
  id,
}: {
  children: React.ReactNode;
  id?: string;
}) => {
  const ref = useRef<FilterStoreApi>();
  if (!ref.current) {
    ref.current = createFilterStore(id);
  }

  return (
    <FilterStoreContext.Provider value={ref.current}>
      {children}
    </FilterStoreContext.Provider>
  );
};

export function useFilterStoreContext() {
  const context = useContext(FilterStoreContext);
  if (!context) {
    throw new Error("FilterStore must be used within a FilterStoreProvider");
  }
  return context;
}

export function useFilterStore<T>(selector: (state: FilterStore) => T): T;
export function useFilterStore(): FilterStore;
export function useFilterStore<T>(
  selector?: (state: FilterStore) => T,
): T | FilterStore {
  const context = useFilterStoreContext();

  if (!selector) {
    return context();
  }

  return context(selector);
}
