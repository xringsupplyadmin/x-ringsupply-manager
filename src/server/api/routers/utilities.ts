import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const utilitiesRouter = createTRPCRouter({
  sass: {
    getAll: protectedProcedure.query(
      async ({
        ctx: {
          db: { e, client },
        },
      }) => {
        return await e
          .select(e.utils.SassHeader, (s) => ({
            id: true,
            name: true,
            internal: true,
            includeOrder: true,
            order_by: [s.internal, s.includeOrder],
          }))
          .run(client);
      },
    ),
    getStylesheet: protectedProcedure
      .input(
        z.object({
          id: z.string().optional(),
        }),
      )
      .query(
        async ({
          ctx: {
            db: { e, client },
          },
          input: { id },
        }) => {
          return await e
            .select(e.utils.SassHeader, (s) => ({
              ...s["*"],
              filter_single: id ? e.op(s.id, "=", e.uuid(id)) : e.bool(false),
            }))
            .run(client);
        },
      ),
    saveStylesheet: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          value: z.string(),
        }),
      )
      .mutation(
        async ({
          ctx: {
            db: { e, client },
          },
          input: { id, value },
        }) => {
          return await e
            .update(e.utils.SassHeader, (s) => ({
              filter_single: e.op(s.id, "=", e.uuid(id)),
              set: {
                value: value,
              },
            }))
            .run(client);
        },
      ),
    createStylesheet: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          internal: z.boolean(),
        }),
      )
      .mutation(async ({ ctx }) => {
        return "";
      }),
    compileCheck: protectedProcedure.query(async ({ ctx }) => {
      return true;
    }),
    getCombinedStylesheet: protectedProcedure.query(async ({ ctx }) => {
      return "";
    }),
  },
});
