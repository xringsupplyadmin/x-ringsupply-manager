import { z } from "zod";
import {
  CartTemplate,
  getTemplateHtml,
} from "~/components/email/cart_template";
import { env } from "~/env";
import { inngest } from "../inngest";
import {
  deleteTask,
  getTask,
  logTaskStep,
  updateTaskSequence,
} from "./task_common";
import logInngestError from "./error_handling";
import e from "@/dbschema/edgeql-js";
import client from "~/server/db/client";
import { updateContactCart } from "./update_contact_cart";

const CoreillaResponse = z.object({
  status: z.string(),
  id: z.string().nullish(),
});

export const executeTask = inngest.createFunction(
  {
    id: "executeEmailTask",
    name: "Execute Email Task",
    onFailure: logInngestError,
  },
  { event: "task/execute" },
  async ({ event, step }) => {
    const task = await step.run("get-task", async () => {
      return await getTask(event.data.taskId);
    });

    await step.invoke("update-contact-cart", {
      function: updateContactCart,
      data: {
        contactId: task.contact.id,
      },
    });

    const items = await step.run("get-cart-items", async () => {
      return await e
        .select(e.coreforce.CartItem, (item) => ({
          filter: e.op(item.contact.id, "=", e.uuid(task.contact.id)),
          ...item["*"],
        }))
        .run(client);
    });

    const origination = new Date(task.origination);

    // Send the email
    const result = await step.run("send-email", async () => {
      const formData = new FormData();
      formData.set(
        "cart_contents_html",
        await getTemplateHtml(
          CartTemplate({
            items: items,
            debug: {
              origination: origination,
              sequence: task.sequence,
              email: task.contact.email,
              name: task.contact.fullName,
            },
          }),
        ),
      );
      formData.set("sequence", task.sequence.toString());
      formData.set("email", env.DEBUG ? env.DEBUG_EMAIL : task.contact.email);
      formData.set("name", task.contact.fullName);

      const rawResponse = await fetch(env.COREILLA_WEBHOOK_URL, {
        body: formData,
        method: "POST",
      });

      const apiResponse = CoreillaResponse.safeParse(await rawResponse.json());

      const resultBase = {
        id: task.id,
        sequence: task.sequence,
        origination: origination,
        contact: task.contact,
      };
      let result;

      if (apiResponse.success) {
        if (apiResponse.data.id) {
          result = {
            ...resultBase,
            success: true,
            message: "Email sent successfully",
          };
        } else {
          result = {
            ...resultBase,
            success: false,
            message: `Error sending email: ${apiResponse.data.status}`,
          };
        }
      } else {
        result = {
          ...resultBase,
          success: false,
          message: "Error sending email (Invalid API Response)",
        };
      }

      if (result.success) {
        return result;
      } else {
        throw new Error(result.message);
      }
    });

    await step.run("log-task-step", async () => await logTaskStep(result));

    if (task.sequence + 1 >= env.EMAIL_SEQUENCE.length) {
      await step.invoke("delete-completed-task", {
        function: deleteTask,
        data: {
          contactId: task.contact.id,
          sequence: task.sequence,
          reason: "Completed sequence",
        },
      });
    } else {
      await step.run("update-task", async () => {
        await updateTaskSequence(task.id, task.sequence + 1);
      });
    }
  },
);
