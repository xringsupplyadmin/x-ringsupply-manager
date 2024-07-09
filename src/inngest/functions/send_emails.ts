import { inngest } from "../client";
import { sendEmails as implSendEmails } from "~/server/api/functions/send_emails";

export const sendEmails = inngest.createFunction(
  {
    id: "sendEmails",
  },
  { event: "system/send.emails" },
  async () => {
    return await implSendEmails();
  },
);
