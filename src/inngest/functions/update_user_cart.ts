import { fetchApiShoppingCart } from "~/server/api/functions/fetch_cart";
import { syncCartToDb } from "~/server/api/functions/sync_cart";
import { inngest } from "../client";
import { authorizeApi } from "./api_authorization";
import logInngestError from "./error_handling";

export const updateUserCartItems = inngest.createFunction(
  {
    id: "updateUserCarts",
    name: "Update Specific User Carts",
    onFailure: logInngestError,
  },
  { event: "db/update.user.cart_items" },
  async ({ event, step }) => {
    if (event.data.checkAuth) {
      await step.invoke("authorize-api", {
        function: authorizeApi,
        data: {},
      });
    }

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
            await step.invoke("reauthorize-api", {
              function: authorizeApi,
              data: {},
            });
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
