import { z } from "zod";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ApiProduct } from "~/server/api/coreforce/types";

export const EditorStore = z.object({
  edits: z.record(z.string(), ApiProduct.partial()),
});
export type EditorStore = z.infer<typeof EditorStore>;

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
