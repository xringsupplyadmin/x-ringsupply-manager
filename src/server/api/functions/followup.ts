import e from "@/dbschema/edgeql-js";
import { env } from "~/env";
import client from "~/server/db/client";
import { inngest } from "../inngest";
import logInngestError from "./error_handling";

function getSequenceDate(days: number) {
  const sequenceDate = new Date();
  sequenceDate.setUTCHours(sequenceDate.getUTCHours() - days * 24);
  return sequenceDate;
}

export const followup = inngest.createFunction(
  {
    id: "followup",
    name: "Scheduled Follow-Up Task Runner",
    onFailure: logInngestError,
    concurrency: 50,
  },
  { cron: env.FOLLOWUP_CRON },
  async ({ step }) => {
    // Clear out tasks for unsubscribed contacts
    const unsubscribed = await step.run("get-unsubscribed", async () => {
      return await e
        .select(e.coreforce.EmailTask, (t) => ({
          filter: e.op(t.contact.unsubscribed, "=", true),
          id: true,
          sequence: true,
          contact: {
            id: true,
            fullName: true,
            email: true,
          },
        }))
        .run(client);
    });

    await Promise.all(
      unsubscribed.map((task) =>
        step.sendEvent("delete-task-" + task.id, {
          name: "task/delete",
          data: {
            contactId: task.contact.id,
            sequence: task.sequence,
            reason: "Contact Unsubscribed",
          },
        }),
      ),
    );

    const tasks = await step.run("get-tasks", async () => {
      return await e
        .select(e.coreforce.EmailTask, (t) => ({
          filter: e.op(t.contact.unsubscribed, "=", false),
          id: true,
          sequence: true,
          origination: true,
          contact: {
            id: true,
            fullName: true,
            email: true,
          },
        }))
        .run(client);
    });

    return await Promise.all(
      tasks.map(async (task) => {
        const origination = new Date(task.origination);
        const sequenceDates = env.EMAIL_SEQUENCE.map(getSequenceDate);
        const nextSequenceDate = sequenceDates[task.sequence];

        if (!nextSequenceDate) {
          await step.sendEvent("delete-task-" + task.id, {
            name: "task/delete",
            data: {
              contactId: task.contact.id,
              sequence: task.sequence,
              reason: "Invalid sequence",
            },
          });

          return {
            contact: task.contact,
            status: "error",
            message: "Invalid sequence",
          };
        }

        if (nextSequenceDate <= origination) {
          return {
            contact: task.contact,
            status: "skipped",
          };
        }

        await step.sendEvent("execute-task-" + task.id, {
          name: "task/execute",
          data: {
            taskId: task.id,
          },
        });

        return {
          contact: task.contact,
          status: "sent",
        };
      }),
    );
  },
);
