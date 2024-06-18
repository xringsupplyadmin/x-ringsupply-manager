import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const contactRouter = createTRPCRouter({
  contacts: {
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
  },
});
