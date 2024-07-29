import { batchActionAsync } from "~/server/api/common";
import { getContactIds } from "~/server/db/query/coreforce";
import { inngest } from "../client";
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

    let countSynced = 0;
    await batchActionAsync(
      contacts,
      async (contactBatch, index) => {
        countSynced += (
          await step.invoke("update-user-cart-items" + index, {
            function: updateUserCartItems,
            data: {
              contacts: contactBatch,
            },
          })
        ).countSynced;
      },
      750,
    );

    return { countSynced };
  },
);
