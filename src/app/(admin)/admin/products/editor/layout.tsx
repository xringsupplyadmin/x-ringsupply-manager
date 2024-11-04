import { EditorStoreProvider } from "~/stores/providers/editor_store_provider";

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EditorStoreProvider>{children}</EditorStoreProvider>;
}
