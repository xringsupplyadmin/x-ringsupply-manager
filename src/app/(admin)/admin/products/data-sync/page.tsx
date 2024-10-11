import { SearchFilters } from "~/components/ecommerce/filters";
import { ApiProductSearch } from "~/components/ecommerce/product_search";

export default async function DataSyncPage() {
  return <ApiProductSearch filterSidebar={<SearchFilters />} />;
}
