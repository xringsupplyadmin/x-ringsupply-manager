import ServerAuthWrapper from "~/components/server_auth";
import { FilterStoreProvider } from "~/stores/providers/filter_store_provider";
import { SelectStoreProvider } from "~/stores/providers/select_store_provider";
import React from "react";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ServerAuthWrapper modules={["Klaviyo"]}>
      <FilterStoreProvider id="klaviyo-product-search-filters">
        <SelectStoreProvider id="klaviyo-product-search-selected">
          {children}
        </SelectStoreProvider>
      </FilterStoreProvider>
    </ServerAuthWrapper>
  );
}
