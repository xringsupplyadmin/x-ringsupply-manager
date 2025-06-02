import { serve } from "inngest/next";
import products from "~/server/api/functions/ecommerce/products";
import ecommerceSync from "~/server/api/functions/ecommerce/sync";
import { ecommerceAutosync } from "~/server/api/functions/v2/autosync";
import { klaviyoOrderTracking } from "~/server/api/functions/v2/track_order";
import { inngest } from "~/server/api/inngest";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    // authorizeApi,
    // fetchApiCart,
    // createContact,
    // cancelContactTask,
    // updateContactCart,
    // createTask,
    // deleteTask,
    // executeTask,
    // followup
    ...ecommerceSync,
    ...products,
    klaviyoOrderTracking,
    ecommerceAutosync,
  ],
});
