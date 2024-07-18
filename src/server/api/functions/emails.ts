import { z } from "zod";
import {
  CartTemplate,
  getTemplateHtml,
} from "~/components/email/cart_template";
import { env } from "~/env";
import { getAbandonedCarts, getEmailTasks } from "~/server/db/query/coreforce";
import e from "@/dbschema/edgeql-js";
import client from "~/server/db/client";

export async function updateEmailTasks() {
  const carts = await getAbandonedCarts();

  if (carts.length === 0) {
    // Delete all tasks
    await e.delete(e.coreforce.EmailTask, () => ({})).run(client);
    return;
  } else {
    const ids = carts.map((c) => e.uuid(c.id));
    // Delete all tasks for users which no longer have abandoned carts
    await e
      .delete(e.coreforce.EmailTask, (task) => ({
        filter: e.op(task.contact.id, "not in", e.set(...ids)),
      }))
      .run(client);
  }

  console.log(carts);

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
}

const CoreillaResponse = z.object({
  status: z.string(),
  id: z.string().nullish(),
});
type CoreillaResponse = z.infer<typeof CoreillaResponse>;

function getSequenceDate(days: number) {
  const sequenceDate = new Date();
  sequenceDate.setHours(sequenceDate.getHours() - days * 24);
  if (days >= 1) {
    // After 1 day the time doesn't matter
    sequenceDate.setHours(0, 0, 0, 0);
  }
  return sequenceDate;
}

export async function processEmailTasks() {
  const data = await getEmailTasks();

  const responses: CoreillaResponse[] = [];

  const sequenceDates = env.EMAIL_SEQUENCE.map(getSequenceDate);

  console.log(sequenceDates);

  const currentHour = new Date().getHours();

  for (const {
    id,
    sequence,
    origination,
    contact: { primaryEmailAddress, firstName, lastName, items },
  } of data) {
    // Given the list of dates for the sequence, find the sequence number this task is on
    const nextSequence = sequenceDates.findIndex((date) => date <= origination);
    if (nextSequence === -1) {
      console.warn("Couldn't find sequence number for", primaryEmailAddress);
      continue;
    }

    if (
      sequence != null &&
      (nextSequence <= sequence ||
        currentHour < env.FOLLOWUP_START_HOUR ||
        currentHour > env.FOLLOWUP_END_HOUR)
    ) {
      // Email has already been sent for this contact or its not the right time
      continue;
    }

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
      console.log(response.data);
      responses.push(response.data);
      await e
        .update(e.coreforce.EmailTask, (task) => ({
          set: {
            sequence: nextSequence,
          },
          filter: e.op(task.id, "=", e.uuid(id)),
        }))
        .run(client);
    } else {
      console.error(
        "Error sending email to",
        primaryEmailAddress,
        response.error,
      );
    }
  }
  return responses;
}
