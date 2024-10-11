"use client";

import { useEffect } from "react";
import { useDebounce } from "~/hooks/debounce";
import {
  useFilterStore,
  type FilterValue,
  type TaxonomyFilter,
} from "~/lib/stores";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { MultiSelect } from "../ui/multi-select";

function makeSelectOptions(values: FilterValue[]) {
  return values.map((value) => ({
    label: value.description,
    value: value.cfId.toString(),
  }));
}

export function CoreforceFilter({
  values,
  storeName,
  maxVisible,
}: {
  values: FilterValue[];
  storeName: keyof TaxonomyFilter;
  maxVisible?: number;
}) {
  const selected = useFilterStore((state) => state[storeName]);

  return (
    <MultiSelect
      options={makeSelectOptions(values)}
      onValueChange={(value) =>
        useFilterStore.setState(() => ({
          [storeName]: value
            .map((v) => Number.parseInt(v))
            .filter((v) => Number.isFinite(v)), // make sure we only have numbers
        }))
      }
      defaultValue={selected.map((n) => n.toString())}
      placeholder={`Filter ${storeName}`}
      maxCount={5}
      maxVisible={maxVisible}
    />
  );
}

export function SearchTextFilter() {
  const searchText = useFilterStore((state) => state.searchText);
  const [searchInput, setSearchInput, rawInput] = useDebounce<
    string | undefined
  >(undefined, 100);

  useEffect(() => {
    if (searchInput !== undefined) {
      useFilterStore.setState(() => ({ searchText: searchInput }));
    }
  }, [searchInput]);

  return (
    <Input
      placeholder="Search for products"
      value={rawInput ?? searchText}
      onChange={(e) => {
        setSearchInput(e.target.value);
      }}
    />
  );
}

export function ShowOutOfStockFilter() {
  const hideOutOfStock = useFilterStore((state) => state.hideOutOfStock);

  return (
    <div className="flex items-center justify-start gap-2">
      <Checkbox
        id="filter-hide-out-of-stock"
        checked={hideOutOfStock}
        onCheckedChange={(e) => {
          const value = e.valueOf();
          if (typeof value === "boolean") {
            useFilterStore.setState(() => ({ hideOutOfStock: value }));
          }
        }}
      />
      <label htmlFor="filter-hide-out-of-stock">Hide out of stock</label>
    </div>
  );
}
