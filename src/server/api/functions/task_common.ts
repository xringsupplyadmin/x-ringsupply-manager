import e from "@/dbschema/edgeql-js";
import client from "~/server/db/client";
import { inngest } from "../inngest";
import logInngestError from "./error_handling";

type TaskStep = {
  sequence: number;
  contact: {
    id: string;
  };
  success: boolean;
  message: string;
};

/**
 * Log a step of a task to the database
 *
 * @param step The step data
 */
export async function logTaskStep(step: TaskStep) {
  await e
    .insert(e.coreforce.EmailTaskStep, {
      contact: e.select(e.coreforce.Contact, (c) => ({
        filter_single: e.op(c.id, "=", e.uuid(step.contact.id)),
      })),
      sequence: step.sequence,
      success: step.success,
      message: step.message,
    })
    .run(client);
}

export async function getTask(taskId: string) {
  const task = await e
    .select(e.coreforce.EmailTask, (t) => ({
      filter_single: e.op(t.id, "=", e.uuid(taskId)),
      ...e.coreforce.EmailTask["*"],
      contact: {
        ...e.coreforce.EmailTask.contact["*"],
      },
    }))
    .run(client);

  if (!task) {
    throw new Error("Task not found: " + taskId);
  } else {
    return task;
  }
}

export async function updateTaskSequence(taskId: string, sequence: number) {
  await e
    .update(e.coreforce.EmailTask, (t) => ({
      set: {
        sequence: sequence,
      },
      filter_single: e.op(t.id, "=", e.uuid(taskId)),
    }))
    .run(client);
}

export const createTask = inngest.createFunction(
  {
    id: "createEmailTask",
    name: "Create Email Task",
    onFailure: logInngestError,
  },
  { event: "task/create" },
  async ({ event, step }) => {
    const unsubscribed = await step.run("check-unsubscribed", async () => {
      const contact = await e
        .select(e.coreforce.Contact, (c) => ({
          filter_single: e.op(c.id, "=", e.uuid(event.data.contactId)),
          unsubscribed: true,
        }))
        .run(client);

      if (contact == null) {
        throw new Error("Contact not found: " + event.data.contactId);
      }
      return contact.unsubscribed;
    });

    if (unsubscribed) {
      return;
    }

    const newTask = await step.run("create-task", async () => {
      return await e
        .insert(e.coreforce.EmailTask, {
          contact: e.select(e.coreforce.Contact, (c) => ({
            filter_single: e.op(c.id, "=", e.uuid(event.data.contactId)),
          })),
        })
        .unlessConflict((t) => ({
          on: t.contact,
          else: e.update(t, () => ({
            set: {
              sequence: 0,
              origination: e.datetime_current(),
            },
          })),
        }))
        .run(client);
    });

    await step.sendEvent("execute-task", {
      name: "task/execute",
      data: {
        taskId: newTask.id,
      },
    });
  },
);

export const deleteTask = inngest.createFunction(
  {
    id: "deleteEmailTask",
    name: "Delete Email Task",
    onFailure: logInngestError,
  },
  {
    event: "task/delete",
  },
  async ({ event, step }) => {
    await step.run("delete-task", async () => {
      await e
        .delete(e.coreforce.EmailTask, (t) => ({
          filter_single: e.op(t.contact.id, "=", e.uuid(event.data.contactId)),
        }))
        .run(client);
    });

    await step.run("log-task-deleted", async () => {
      await logTaskStep({
        success: true,
        message: `Removed: ${event.data.reason}`,
        sequence: event.data.sequence,
        contact: {
          id: event.data.contactId,
        },
      });
    });
  },
);
