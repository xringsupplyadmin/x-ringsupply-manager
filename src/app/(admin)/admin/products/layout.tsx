import { EditorStoreProvider } from "~/stores/providers/editor_store_provider";
import { FilterStoreProvider } from "~/stores/providers/filter_store_provider";

export default async function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <FilterStoreProvider>
      <EditorStoreProvider>
        {children}
        {modal}
      </EditorStoreProvider>
    </FilterStoreProvider>
  );
}
