import { authorize } from "~/server/api/functions/cf_authorization";
import { fetchApiShoppingCart } from "~/server/api/functions/fetch_cart";
import { syncCartToDb } from "~/server/api/functions/sync_cart";
import { inngest } from "../client";
import { authorizeApi } from "./api_authorization";
import logInngestError from "./error_handling";
import { newTiming, timing } from "~/server/api/common";

export const updateUserCartItems = inngest.createFunction(
  {
    id: "updateUserCarts",
    name: "Update Specific User Carts",
    onFailure: logInngestError,
    concurrency: {
      limit: 5,
      scope: "fn",
    },
  },
  { event: "db/update.user.cart_items" },
  async ({ event, step }) => {
    if (event.data.checkAuth) {
      await step.invoke("authorize-api", {
        function: authorizeApi,
        data: {},
      });
    }

    await Promise.all(
      event.data.contacts.map((contact) =>
        step.run(`update-user-${contact.contactId}-cart-items`, async () => {
          const t = newTiming();
          const apiResponse = await fetchApiShoppingCart(
            contact.contactId,
            false,
          );
          if (!apiResponse.success) {
            // Sometimes the authentication times out, so try again
            await authorize();
            throw new Error("API Error: " + apiResponse.error);
          }
          await syncCartToDb(contact, apiResponse.cart);
          return {
            time: timing(t, true),
          };
        }),
      ),
    );

    return {
      countSynced: event.data.contacts.length,
    };
  },
);
