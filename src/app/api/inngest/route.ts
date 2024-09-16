import { serve } from "inngest/next";
import { inngest } from "~/server/api/inngest";
import { updateContactCart } from "~/server/api/functions/emails/update_contact_cart";
import { authorizeApi } from "~/server/api/functions/retailstore/api_authorization";
import { executeTask } from "~/server/api/functions/emails/execute_task";
import {
  createTask,
  deleteTask,
} from "~/server/api/functions/emails/task_common";
import { fetchApiCart } from "~/server/api/functions/retailstore/fetch_cart";
import { followup } from "~/server/api/functions/emails/followup";
import {
  cancelContactTask,
  createContact,
} from "~/server/api/functions/emails/contact";

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
