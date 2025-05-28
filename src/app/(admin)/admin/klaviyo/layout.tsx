import { FilterStoreProvider } from "~/stores/providers/filter_store_provider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FilterStoreProvider id="klaviyo-product-search-filters">
      {children}
    </FilterStoreProvider>
  );
}
