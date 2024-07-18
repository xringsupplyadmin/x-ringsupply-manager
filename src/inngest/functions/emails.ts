import { inngest } from "../client";
import { processEmailTasks as implProcessEmailTasks } from "~/server/api/functions/emails";
import { updateEmailTasks as implUpdateEmailTasks } from "~/server/api/functions/emails";

export const updateEmailTasks = inngest.createFunction(
  {
    id: "updateEmailTasks",
  },
  { event: "system/update.email.tasks" },
  async () => {
    return await implUpdateEmailTasks();
  },
);

export const processEmailTasks = inngest.createFunction(
  {
    id: "processEmailTasks",
  },
  { event: "system/process.email.tasks" },
  async () => {
    return await implProcessEmailTasks();
  },
);
