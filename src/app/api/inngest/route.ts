import { serve } from "inngest/next";
import { inngest } from "~/inngest/client";
import { watchdog } from "~/inngest/functions/watchdog";
import { updateAllCartItems } from "~/inngest/functions/update_all_carts";
import { updateContacts } from "~/inngest/functions/update_contacts";
import {
  processEmailTasks,
  updateEmailTasks,
} from "~/inngest/functions/emails";
import { updateUserCartItems } from "~/inngest/functions/update_user_cart";
import { authorizeApi } from "~/inngest/functions/api_authorization";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    authorizeApi,
    updateContacts,
    updateAllCartItems,
    updateUserCartItems,
    updateEmailTasks,
    processEmailTasks,
    watchdog,
  ],
});
