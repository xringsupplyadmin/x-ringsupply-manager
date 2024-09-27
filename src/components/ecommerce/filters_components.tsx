"use client";

import { useEffect } from "react";
import { useDebounce } from "~/lib/hooks";
import {
  useFilterStore,
  type FilterValue,
  type TaxonomyFilter,
} from "~/lib/stores";
import { Input } from "../ui/input";
import { MultiSelect } from "../ui/multi-select";

function makeSelectOptions(values: FilterValue[]) {
  return values.map((value) => ({
    label: value.description,
    value: value.cfId.toString(),
  }));
}

/**
 * This really needs to be optimized
 */
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
        useFilterStore.setState(() => ({ [storeName]: value }))
      }
      defaultValue={selected.map((n) => n.toString())}
      placeholder={`Filter ${storeName}`}
      maxCount={5}
      maxVisible={maxVisible}
    />
  );
}

export function SearchTextFilter() {
  const { searchText } = useFilterStore();
  const [searchInput, setSearchInput] = useDebounce<string | undefined>(
    undefined,
    100,
  );

  useEffect(() => {
    if (searchInput)
      useFilterStore.setState(() => ({ searchText: searchInput }));
  }, [searchInput]);

  return (
    <Input
      placeholder="Search for products"
      defaultValue={searchText}
      onChange={(e) => setSearchInput(e.target.value)}
    />
  );
}
