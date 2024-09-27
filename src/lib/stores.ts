import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FilterValue = {
  description: string;
  cfId: number;
};

export type TaxonomyFilter = {
  categories: number[];
  departments: number[];
  manufacturers: number[];
  tags: number[];
  locations: number[];
  products: number[];
};

export type SearchFilter = {
  searchText: string;
  showOutOfStock: boolean;
};

export type FilterStore = TaxonomyFilter & SearchFilter;

export const useFilterStore = create<FilterStore>()(
  persist(
    (): FilterStore => ({
      categories: [],
      departments: [],
      manufacturers: [],
      tags: [],
      locations: [],
      products: [],
      searchText: "",
      showOutOfStock: false,
    }),
    {
      name: "ecommerce-filters",
    },
  ),
);

// useStore.ts
import { useState, useEffect } from "react";

export const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F,
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};

export default useStore;
