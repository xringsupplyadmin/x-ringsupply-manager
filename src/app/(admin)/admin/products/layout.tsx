import { EditorStoreProvider } from "~/stores/providers/editor_store_provider";

export default async function Layout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <EditorStoreProvider>
      {children}
      {modal}
    </EditorStoreProvider>
  );
}
