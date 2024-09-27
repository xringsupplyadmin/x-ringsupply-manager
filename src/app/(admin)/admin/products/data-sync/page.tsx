import { ApiProductSearch } from "~/components/ecommerce/product_search";
import { SearchFilters } from "~/components/ecommerce/filters";

export default async function DataSyncPage() {
  return <ApiProductSearch filterSidebar={<SearchFilters />} />;
}
