import { authorize } from "~/server/api/functions/cf_authorization";
import { fetchApiShoppingCart } from "~/server/api/functions/fetch_cart";
import { syncCartToDb } from "~/server/api/functions/sync_cart";
import { inngest } from "../client";
import { authorizeApi } from "./api_authorization";
import logInngestError from "./error_handling";
import { batchActionAsync, newTiming, timing } from "~/server/api/common";

const MAX_CONCURRENCY = 5;

export const updateUserCartItems = inngest.createFunction(
  {
    id: "updateUserCarts",
    name: "Update Specific User Carts",
    onFailure: logInngestError,
    concurrency: {
      limit: MAX_CONCURRENCY,
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

    // Rebatch for some reason
    await batchActionAsync(
      event.data.contacts,
      async (batch) => {
        await Promise.all(
          batch.map((contact) =>
            step.run(
              `update-user-${contact.contactId}-cart-items`,
              async () => {
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
              },
            ),
          ),
        );
      },
      MAX_CONCURRENCY,
    );

    return {
      countSynced: event.data.contacts.length,
    };
  },
);
