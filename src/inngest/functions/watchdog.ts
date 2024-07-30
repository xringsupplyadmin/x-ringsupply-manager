import { env } from "~/env";
import { inngest } from "../client";
import { updateEmailTasks, processEmailTasks } from "./emails";
import { updateAllCartItems } from "./update_all_carts";
import { updateContacts } from "./update_contacts";

/**
 * This function is called every 4 hours to update the contacts, cart items, and email tasks.
 * It also queues the email tasks and sends the emails.
 */
export const watchdog = inngest.createFunction(
  {
    id: "watchdog",
    name: "Scheduled Task Runner",
    concurrency: {
      limit: 1,
      scope: "env",
      key: "Watchdog",
    },
  },
  { cron: env.WATCHDOG_CRON },
  async ({ step }) => {
    await step.invoke("update-contacts", {
      function: updateContacts,
      data: {},
    });
    await step.invoke("update-cart-items", {
      function: updateAllCartItems,
      data: {},
    });
    await step.invoke("queue-email-tasks", {
      function: updateEmailTasks,
      data: {},
    });
    await step.invoke("process-email-tasks", {
      function: processEmailTasks,
      data: {},
    });
  },
);
