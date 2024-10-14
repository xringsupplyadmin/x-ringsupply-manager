import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const FilterValue = z.object({
  description: z.string(),
  cfId: z.number(),
});
export type FilterValue = z.infer<typeof FilterValue>;

export const TaxonomyFilter = z.object({
  categories: z.number().array(),
  departments: z.number().array(),
  manufacturers: z.number().array(),
  tags: z.number().array(),
  locations: z.number().array(),
});
export type TaxonomyFilter = z.infer<typeof TaxonomyFilter>;

export const SearchFilter = z.object({
  searchText: z.string(),
  hideOutOfStock: z.boolean(),
});
export type SearchFilter = z.infer<typeof SearchFilter>;

export const FilterStore = TaxonomyFilter.and(SearchFilter);
export type FilterStore = z.infer<typeof FilterStore>;

export const createFilterStore = () =>
  create(
    persist<FilterStore>(
      (): FilterStore => ({
        categories: [],
        departments: [],
        manufacturers: [],
        tags: [],
        locations: [],
        searchText: "",
        hideOutOfStock: true,
      }),
      {
        name: "ecommerce-filters",
      },
    ),
  );
