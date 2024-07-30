import { z } from "zod";
import {
  CartTemplate,
  getTemplateHtml,
} from "~/components/email/cart_template";
import { env } from "~/env";
import { getAbandonedCarts, getEmailTasks } from "~/server/db/query/coreforce";
import e from "@/dbschema/edgeql-js";
import client from "~/server/db/client";
import { type ApiResponse } from "../common";

export async function updateEmailTasks(): Promise<
  ApiResponse<{ currentTasks: string[] }>
> {
  const carts = await getAbandonedCarts();

  if (carts.length === 0) {
    // Delete all tasks
    await e.delete(e.coreforce.EmailTask, () => ({})).run(client);
    return {
      success: true,
      currentTasks: [],
    };
  } else {
    const ids = carts.map((c) => e.uuid(c.id));
    // Delete all tasks for users which no longer have abandoned carts
    const removed = await e
      .delete(e.coreforce.EmailTask, (task) => ({
        filter: e.op(task.contact.id, "not in", e.set(...ids)),
      }))
      .run(client);

    for (const { id: removedId } of removed) {
      await e
        .insert(e.coreforce.EmailTaskStep, {
          contact: e.select(e.coreforce.Contact, (c) => ({
            filter_single: e.op(c.id, "=", e.uuid(removedId)),
          })),
          message: "Removed from workflow",
          success: true,
          sequence: e.set(),
        })
        .run(client);
    }
  }

  for (const cart of carts) {
    const task = e
      .insert(e.coreforce.EmailTask, {
        contact: e.select(e.coreforce.Contact, (c) => ({
          filter_single: e.op(c.id, "=", e.uuid(cart.id)),
        })),
      })
      .unlessConflict(); // If the task already exists, do nothing
    await task.run(client);
  }

  return {
    success: true,
    currentTasks: carts.map((c) => c.id),
  };
}

type TaskResult = {
  id: string;
  sequence: number | null;
  origination: Date;
  sequenceDate?: Date;
  currentHour?: number;
  contact: {
    contactId: string;
    primaryEmailAddress: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  status: "sent" | "skipped" | "failed";
  message: string;
};

const CoreillaResponse = z.object({
  status: z.string(),
  id: z.string().nullish(),
});
type CoreillaResponse = z.infer<typeof CoreillaResponse>;

function getSequenceDate(days: number) {
  const sequenceDate = new Date();
  sequenceDate.setUTCHours(sequenceDate.getUTCHours() - days * 24);
  return sequenceDate;
}

export async function processEmailTasks(): Promise<
  ApiResponse<{ tasks: TaskResult[] }>
> {
  const data = await getEmailTasks();
  const taskResults: TaskResult[] = [];

  const sequenceDates = env.EMAIL_SEQUENCE.map(getSequenceDate);
  const currentHour = new Date().getUTCHours();

  for (const {
    id,
    sequence,
    origination,
    contact: { id: contactId, primaryEmailAddress, firstName, lastName, items },
  } of data) {
    const nextSequence = (sequence ?? -1) + 1;
    const taskResult = {
      id,
      sequence: nextSequence,
      origination,
      contact: { contactId, primaryEmailAddress, firstName, lastName },
    };

    // Check required conditions

    if (nextSequence >= sequenceDates.length) {
      // Delete the task if there are no more emails left in the sequence
      await e
        .delete(e.coreforce.EmailTask, (t) => ({
          filter: e.op(t.id, "=", e.uuid(id)),
        }))
        .run(client);
      taskResults.push({
        ...taskResult,
        currentHour: currentHour,
        status: "skipped",
        message: "No more emails left in sequence",
      });
      continue;
    }

    const nextSequenceDate = sequenceDates[nextSequence]!;

    if (nextSequenceDate <= origination) {
      taskResults.push({
        ...taskResult,
        sequenceDate: nextSequenceDate,
        currentHour: currentHour,
        status: "skipped",
        message: "Next email sequence date has not passed yet",
      });
      continue;
    }

    if (
      currentHour < env.FOLLOWUP_START_HOUR ||
      currentHour > env.FOLLOWUP_END_HOUR
    ) {
      taskResults.push({
        ...taskResult,
        sequenceDate: nextSequenceDate,
        currentHour: currentHour,
        status: "skipped",
        message: "Outside of alloted window for followup emails",
      });
      continue;
    }

    // Send the email

    const formData = new FormData();
    formData.set(
      "cart_contents_html",
      await getTemplateHtml(
        CartTemplate({
          items: items,
          debug: {
            origination: origination,
            sequence: nextSequence.toString(),
            email: primaryEmailAddress ?? "NoEmail",
            firstName: firstName ?? "NoFirstName",
            lastName: lastName ?? "NoLastName",
          },
        }),
      ),
    );
    formData.set("sequence", nextSequence.toString());
    formData.set("email", "mmeredith@x-ringsupply.com");
    // Create the name from the first and last name
    const name = [firstName, lastName].filter((s) => !!s).join(" ");
    formData.set("name", name === "" ? "Customer" : name);

    const rawResponse = await fetch(env.COREILLA_WEBHOOK_URL, {
      body: formData,
      method: "POST",
    });

    const response = CoreillaResponse.safeParse(await rawResponse.json());
    if (response.success) {
      if (response.data.id) {
        taskResults.push({
          ...taskResult,
          sequenceDate: nextSequenceDate,
          currentHour: currentHour,
          status: "sent",
          message: "Email sent successfully",
        });
        await e
          .update(e.coreforce.EmailTask, (task) => ({
            set: {
              sequence: nextSequence,
            },
            filter: e.op(task.id, "=", e.uuid(id)),
          }))
          .run(client);
      } else {
        taskResults.push({
          ...taskResult,
          sequenceDate: nextSequenceDate,
          currentHour: currentHour,
          status: "failed",
          message: response.data.status,
        });
      }
    } else {
      taskResults.push({
        ...taskResult,
        sequenceDate: nextSequenceDate,
        currentHour: currentHour,
        status: "failed",
        message: "Error sending email to contact (Invalid API Response)",
      });
    }
  }

  // Log the results

  for (const tr of taskResults.filter(
    (tr) => tr.status === "sent" || tr.status === "failed",
  )) {
    await e
      .insert(e.coreforce.EmailTaskStep, {
        contact: e.select(e.coreforce.Contact, (c) => ({
          filter_single: e.op(c.id, "=", e.uuid(tr.contact.contactId)),
        })),
        sequence: tr.sequence,
        success: tr.status === "sent",
        message: tr.message,
      })
      .run(client);
  }

  return {
    success: true,
    tasks: taskResults,
  };
}
