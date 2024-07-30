import { authorize } from "~/server/api/functions/cf_authorization";
import { fetchApiShoppingCart } from "~/server/api/functions/fetch_cart";
import { syncCartToDb } from "~/server/api/functions/sync_cart";
import { inngest } from "../client";
import logInngestError from "./error_handling";

export const updateUserCartItems = inngest.createFunction(
  {
    id: "updateUserCarts",
    name: "Update Specific User Carts",
    onFailure: logInngestError,
    concurrency: {
      limit: 2,
      scope: "env",
      key: "RetailStore",
    },
  },
  { event: "db/update.user.cart_items" },
  async ({ event, step }) => {
    await step.run("authorize-api", async () => {
      const authResponse = await authorize();

      if (!authResponse.success) {
        throw new Error("Authorization failed: " + authResponse.error);
      }
    });

    for (const contact of event.data.contacts) {
      await step.run(
        `update-user-${contact.contactId}-cart-items`,
        async () => {
          const apiResponse = await fetchApiShoppingCart(
            contact.contactId,
            false,
          );
          if (!apiResponse.success) {
            // Sometimes the authentication times out, so try again
            if (apiResponse.error.startsWith("AUTH")) {
              await authorize();
            }
            throw new Error("API Error: " + apiResponse.error);
          }
          await syncCartToDb(contact, apiResponse.cart);
        },
      );
    }

    return {
      countSynced: event.data.contacts.length,
    };
  },
);
