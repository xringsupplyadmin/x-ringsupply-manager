import { create } from "zustand";

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
};

export const useFilterStore = create<TaxonomyFilter & SearchFilter>(() => ({
  categories: [],
  departments: [],
  manufacturers: [],
  tags: [],
  locations: [],
  products: [],
  searchText: "",
}));
