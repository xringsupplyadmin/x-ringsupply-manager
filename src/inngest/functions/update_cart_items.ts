import { syncCartToDb } from "~/server/api/functions/sync_cart";
import { inngest } from "../client";

export const updateCartItems = inngest.createFunction(
  {
    id: "updateCartItems",
  },
  { event: "db/update.cart_items" },
  async () => {
    return await syncCartToDb();
  },
);
