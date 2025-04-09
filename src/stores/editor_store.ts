import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ApiProductEditable } from "~/server/api/coreforce/types";

export const EditorStore = z.object({
  edits: z.record(z.string(), ApiProductEditable.partial()),
});
export type EditorStore = z.infer<typeof EditorStore> & {
  update: (productId: number, data: Partial<ApiProductEditable>) => void;
  reset: (productId: number) => void;
};

export const createEditorStore = () =>
  create(
    persist<EditorStore>(
      (set) => ({
        edits: {},
        update: (productId: number, data: Partial<ApiProductEditable>) =>
          set((state) => ({
            edits: {
              ...state.edits,
              [productId]: {
                ...state.edits[productId],
                ...data,
              },
            },
          })),
        reset: (productId: number) =>
          set((state) => ({
            edits: {
              ...state.edits,
              [productId]: undefined,
            },
          })),
      }),
      {
        name: "editor-store",
      },
    ),
  );
