import { batchAction } from "~/server/api/common";
import { getContactIds } from "~/server/db/query/coreforce";
import { inngest } from "../client";
import { authorizeApi } from "./api_authorization";
import logInngestError from "./error_handling";
import { updateUserCartItems } from "./update_user_cart";

export const updateAllCartItems = inngest.createFunction(
  {
    id: "updateAllCarts",
    name: "Update All User Carts",
    onFailure: logInngestError,
  },
  { event: "db/update.cart_items" },
  async ({ step }) => {
    const contacts = await step.run("fetch-db-contacts", async () => {
      return await getContactIds();
    });

    await step.invoke("authorize-api", {
      function: authorizeApi,
      data: {},
    });

    const batches = await step.run("create-batches", async () => {
      return batchAction(contacts, (batch, index) => ({ batch, index }), 100);
    });

    let countSynced = 0;
    for (const { batch, index } of batches) {
      countSynced += (
        await step.invoke("update-user-cart-items-" + index, {
          function: updateUserCartItems,
          data: {
            contacts: batch,
            checkAuth: false,
          },
        })
      ).countSynced;
    }

    return { countSynced };
  },
);
