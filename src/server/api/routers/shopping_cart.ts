import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const shoppingCartRouter = createTRPCRouter({
  shopping_cart: {
    getItems: protectedProcedure
      .input(
        z.object({
          contactId: z.number(),
        }),
      )
      .query(async ({ ctx, input: { contactId } }) => {
        const items = await ctx.db.query.cartItems.findMany({
          where: (items, { eq }) => eq(items.contactId, contactId),
          with: {
            productAddons: true,
          },
        });
        return items;
      }),
  },
});
