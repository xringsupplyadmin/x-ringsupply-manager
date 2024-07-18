import { serve } from "inngest/next";
import { inngest } from "~/inngest/client";
import { watchdog } from "~/inngest/functions/watchdog";
import { updateCartItems } from "~/inngest/functions/update_cart_items";
import { updateContacts } from "~/inngest/functions/update_contacts";
import {
  processEmailTasks,
  updateEmailTasks,
} from "~/inngest/functions/emails";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    updateContacts,
    updateCartItems,
    updateEmailTasks,
    processEmailTasks,
    watchdog,
  ],
});
