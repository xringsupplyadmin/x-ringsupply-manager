import { inngest } from "../client";
import { updateEmailTasks, processEmailTasks } from "./emails";
import { updateCartItems } from "./update_cart_items";
import { updateContacts } from "./update_contacts";

/**
 * This function is called every 4 hours to update the contacts, cart items, and email tasks.
 * It also queues the email tasks and sends the emails.
 */
export const watchdog = inngest.createFunction(
  {
    id: "watchdog",
  },
  { cron: "TZ=America/New_York 0 0-23/4 * * *" },
  async ({ step }) => {
    await step.invoke("update-contacts", {
      function: updateContacts,
    });
    await step.invoke("update-cart-items", {
      function: updateCartItems,
    });
    await step.invoke("queue-email-tasks", {
      function: updateEmailTasks,
    });
    await step.invoke("process-email-tasks", {
      function: processEmailTasks,
    });
  },
);
