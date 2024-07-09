import { serve } from "inngest/next";
import { inngest } from "~/inngest/client";
import { nightly } from "~/inngest/functions/nightly";
import { sendEmails } from "~/inngest/functions/send_emails";
import { updateCartItems } from "~/inngest/functions/update_cart_items";
import { updateContacts } from "~/inngest/functions/update_contacts";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    updateContacts,
    updateCartItems,
    sendEmails,
    nightly,
  ],
});
