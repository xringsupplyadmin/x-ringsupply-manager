import { inngest } from "../client";
import { processEmailTasks as implProcessEmailTasks } from "~/server/api/functions/emails";
import { updateEmailTasks as implUpdateEmailTasks } from "~/server/api/functions/emails";

export const updateEmailTasks = inngest.createFunction(
  {
    id: "updateEmailTasks",
    name: "Update Email Tasks",
  },
  { event: "system/update.email.tasks" },
  async () => {
    return await implUpdateEmailTasks();
  },
);

export const processEmailTasks = inngest.createFunction(
  {
    id: "processEmailTasks",
    name: "Process Email Tasks",
  },
  { event: "system/process.email.tasks" },
  async () => {
    return await implProcessEmailTasks();
  },
);
