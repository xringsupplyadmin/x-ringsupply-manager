import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ApiProduct } from "~/server/api/coreforce/api_util";

export type EditorStore = {
  edits: {
    [cfId: number]: Partial<ApiProduct>;
  };
};

export const createEditorStore = () =>
  create(
    persist<EditorStore>(
      () => ({
        edits: {},
      }),
      {
        name: "editor-store",
      },
    ),
  );
