import { EditorStoreProvider } from "~/stores/providers/editor_store_provider";
import { FilterStoreProvider } from "~/stores/providers/filter_store_provider";
import React from "react";
import ServerAuthWrapper from "~/components/server_auth";

export default async function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <ServerAuthWrapper modules={["ProductEditor"]}>
      <FilterStoreProvider>
        <EditorStoreProvider>
          {children}
          {modal}
        </EditorStoreProvider>
      </FilterStoreProvider>
    </ServerAuthWrapper>
  );
}
