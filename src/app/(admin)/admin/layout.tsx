import ServerAuthWrapper from "~/components/server_auth";
import { FilterStoreProvider } from "~/stores/providers/filter_store_provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <FilterStoreProvider>
      <ServerAuthWrapper page={() => children} />
    </FilterStoreProvider>
  );
}
