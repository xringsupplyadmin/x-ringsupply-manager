import { inngest } from "../client";
import { sendEmails } from "./send_emails";
import { updateCartItems } from "./update_cart_items";
import { updateContacts } from "./update_contacts";

export const nightly = inngest.createFunction(
  {
    id: "nightly",
  },
  { cron: "TZ=America/New_York 0 0 * * *" },
  async ({ step }) => {
    await step.invoke("update-contacts", {
      function: updateContacts,
    });
    await step.invoke("update-cart-items", {
      function: updateCartItems,
    });
    const emailTime = new Date();
    emailTime.setHours(10);
    await step.sleepUntil("email-send-delay", emailTime);
    await step.invoke("send-emails", {
      function: sendEmails,
    });
  },
);
