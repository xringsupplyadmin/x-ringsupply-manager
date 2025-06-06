import client from "~/server/db/client";
import { inngest } from "../../inngest";
import logInngestError from "./error_handling";
import { qb } from "@/dbschema/query_builder";

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
  await qb
    .insert(qb.coreforce.EmailTaskStep, {
      contact: qb.select(qb.coreforce.Contact, (c) => ({
        filter_single: qb.op(c.id, "=", qb.uuid(step.contact.id)),
      })),
      sequence: step.sequence,
      success: step.success,
      message: step.message,
    })
    .run(client);
}

export async function getTask(taskId: string) {
  const task = await qb
    .select(qb.coreforce.EmailTask, (t) => ({
      filter_single: qb.op(t.id, "=", qb.uuid(taskId)),
      ...qb.coreforce.EmailTask["*"],
      contact: {
        ...qb.coreforce.EmailTask.contact["*"],
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
  await qb
    .update(qb.coreforce.EmailTask, (t) => ({
      set: {
        sequence: sequence,
      },
      filter_single: qb.op(t.id, "=", qb.uuid(taskId)),
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
      const contact = await qb
        .select(qb.coreforce.Contact, (c) => ({
          filter_single: qb.op(c.id, "=", qb.uuid(event.data.contactId)),
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
      return await qb
        .insert(qb.coreforce.EmailTask, {
          contact: qb.select(qb.coreforce.Contact, (c) => ({
            filter_single: qb.op(c.id, "=", qb.uuid(event.data.contactId)),
          })),
        })
        .unlessConflict((t) => ({
          on: t.contact,
          else: qb.update(t, () => ({
            set: {
              sequence: 0,
              origination: qb.datetime_current(),
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
      await qb
        .delete(qb.coreforce.EmailTask, (t) => ({
          filter_single: qb.op(
            t.contact.id,
            "=",
            qb.uuid(event.data.contactId),
          ),
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
