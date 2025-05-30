import { FilterStoreProvider } from "~/stores/providers/filter_store_provider";
import { SelectStoreProvider } from "~/stores/providers/select_store_provider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FilterStoreProvider id="klaviyo-product-search-filters">
      <SelectStoreProvider id="klaviyo-product-search-selected">
        {children}
      </SelectStoreProvider>
    </FilterStoreProvider>
  );
}
