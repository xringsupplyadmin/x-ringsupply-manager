import { serve } from "inngest/next";
import { inngest } from "~/server/api/inngest";
import { updateContactCart } from "~/server/api/functions/update_contact_cart";
import { authorizeApi } from "~/server/api/functions/api_authorization";
import { executeTask } from "~/server/api/functions/execute_task";
import { createTask, deleteTask } from "~/server/api/functions/task_common";
import { fetchApiCart } from "~/server/api/functions/fetch_cart";
import { followup } from "~/server/api/functions/followup";
import {
  cancelContactTask,
  createContact,
} from "~/server/api/functions/contact";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    authorizeApi,
    fetchApiCart,
    createContact,
    cancelContactTask,
    updateContactCart,
    createTask,
    deleteTask,
    executeTask,
    followup,
  ],
});
