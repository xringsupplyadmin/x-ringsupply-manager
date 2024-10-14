"use client";

import { createContext, useContext, useRef } from "react";
import { createEditorStore, type EditorStore } from "../editor_store";

export type EditorStoreApi = ReturnType<typeof createEditorStore>;

export const EditorStoreContext = createContext<EditorStoreApi | undefined>(
  undefined,
);

export const EditorStoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const ref = useRef<EditorStoreApi>();
  if (!ref.current) {
    ref.current = createEditorStore();
  }

  return (
    <EditorStoreContext.Provider value={ref.current}>
      {children}
    </EditorStoreContext.Provider>
  );
};

export function useEditorScoreContext() {
  const context = useContext(EditorStoreContext);
  if (!context) {
    throw new Error("EditorStore must be used within a EditorStoreProvider");
  }
  return context;
}

export function useEditorStore<T>(selector: (state: EditorStore) => T): T;
export function useEditorStore(): EditorStore;
export function useEditorStore<T>(
  selector?: (state: EditorStore) => T,
): T | EditorStore {
  const context = useEditorScoreContext();

  if (!selector) {
    return context();
  }

  return context(selector);
}
