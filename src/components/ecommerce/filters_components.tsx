"use client";

import {
  useFilterStore,
  type FilterValue,
  type TaxonomyFilter,
} from "~/lib/stores";
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
}: {
  values: FilterValue[];
  storeName: keyof TaxonomyFilter;
}) {
  const selected = useFilterStore((state) => state[storeName]);

  return (
    <MultiSelect
      options={makeSelectOptions(values)}
      onValueChange={(value) =>
        useFilterStore.setState(() => ({ [storeName]: value }))
      }
      defaultValue={selected.map(toString)}
      placeholder={`Filter ${storeName}`}
      maxCount={5}
    />
  );
}
