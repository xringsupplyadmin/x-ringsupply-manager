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
  hideOutOfStock: boolean;
};

export type FilterStore = TaxonomyFilter & SearchFilter;

// There's something not quite right about this implementation
// But I can't figure it out so its fine for now...
export const useFilterStore = create(
  persist(
    (): FilterStore => ({
      categories: [],
      departments: [],
      manufacturers: [],
      tags: [],
      locations: [],
      products: [],
      searchText: "",
      hideOutOfStock: true,
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
