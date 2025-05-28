"use client";

import { Loader2 } from "lucide-react";
import { type FilterValue, type TaxonomyFilter } from "~/stores/filter_store";
import {
  useFilterStore,
  useFilterStoreContext,
} from "~/stores/providers/filter_store_provider";
import { api } from "~/trpc/react";
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
  const filterStore = useFilterStoreContext();
  const selected = useFilterStore((state) => state[storeName]);

  return (
    <MultiSelect
      options={makeSelectOptions(values)}
      onValueChange={(value) =>
        filterStore.setState(() => ({
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

export function SearchTextFilter({
  startSearch,
}: {
  startSearch?: () => void;
}) {
  const filterStore = useFilterStoreContext();
  const searchText = useFilterStore((state) => state.searchText);

  return (
    <Input
      placeholder="Search for products"
      defaultValue={searchText}
      onChange={(e) => {
        filterStore.setState(() => ({ searchText: e.target.value }));
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") startSearch?.();
      }}
    />
  );
}

export function ShowOutOfStockFilter() {
  const filterStore = useFilterStoreContext();
  const hideOutOfStock = useFilterStore((state) => state.hideOutOfStock);

  return (
    <div className="flex items-center justify-start gap-2">
      <Checkbox
        id="filter-hide-out-of-stock"
        checked={hideOutOfStock}
        onCheckedChange={(e) => {
          const value = e.valueOf();
          if (typeof value === "boolean") {
            filterStore.setState(() => ({ hideOutOfStock: value }));
          }
        }}
      />
      <label htmlFor="filter-hide-out-of-stock">Hide out of stock</label>
    </div>
  );
}

export function FilterSidebar({ startSearch }: { startSearch?: () => void }) {
  const { data: sidebar } = api.ecommerce.db.taxonomy.getSidebar.useQuery();

  if (sidebar) {
    return (
      <>
        <SearchTextFilter startSearch={startSearch} />
        <CoreforceFilter values={sidebar.categories} storeName="categories" />
        <CoreforceFilter values={sidebar.departments} storeName="departments" />
        <CoreforceFilter
          values={sidebar.manufacturers}
          storeName="manufacturers"
        />
        <CoreforceFilter values={sidebar.tags} storeName="tags" />
        <CoreforceFilter values={sidebar.locations} storeName="locations" />
        <ShowOutOfStockFilter />
      </>
    );
  } else {
    return <Loader2 className="animate-spin self-center" />;
  }
}
