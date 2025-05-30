import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SelectStore = {
  selected: string[];
};

export const createSelectStore = (id: string) =>
  create(
    persist<SelectStore>(
      (): SelectStore => ({
        selected: [],
      }),
      {
        name: id,
      },
    ),
  );
