"use client";

import { createContext, useContext, useRef } from "react";
import { createSelectStore, type SelectStore } from "../select_store";

export type SelectStoreApi = ReturnType<typeof createSelectStore>;

export const SelectStoreContext = createContext<SelectStoreApi | undefined>(
  undefined,
);

export const SelectStoreProvider = ({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) => {
  const ref = useRef<SelectStoreApi>();
  if (!ref.current) {
    ref.current = createSelectStore(id);
  }

  return (
    <SelectStoreContext.Provider value={ref.current}>
      {children}
    </SelectStoreContext.Provider>
  );
};

export function useSelectStoreContext() {
  const context = useContext(SelectStoreContext);
  if (!context) {
    throw new Error("SelectStore must be used within a SelectStoreProvider");
  }
  return context;
}

export function useSelectStore<T>(selector: (state: SelectStore) => T): T;
export function useSelectStore(): SelectStore;
export function useSelectStore<T>(
  selector?: (state: SelectStore) => T,
): T | SelectStore {
  const context = useSelectStoreContext();

  if (!selector) {
    return context();
  }

  return context(selector);
}
