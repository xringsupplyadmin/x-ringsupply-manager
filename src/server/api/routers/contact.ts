import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { syncContactsToDb } from "../functions/sync_contacts";
import { ApiResponse } from "../common";

export const contactRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const contacts = await ctx.db.query.contacts.findMany();
    return contacts;
  }),
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input: id }) => {
      const contact = await ctx.db.query.contacts.findFirst({
        where: (contacts, { eq }) => eq(contacts.id, id),
      });
      return contact;
    }),
  syncToDb: protectedProcedure
    .output(ApiResponse({ count: z.number() }))
    .mutation(async ({ ctx }) => {
      return await syncContactsToDb();
    }),
});
