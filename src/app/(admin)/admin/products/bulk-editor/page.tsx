import { DbProductSearch } from "~/components/ecommerce/product_search";
import { SearchFilters } from "~/components/ecommerce/filters";

export default async function BulkEditPage() {
  return <DbProductSearch filterSidebar={<SearchFilters />} />;
}
