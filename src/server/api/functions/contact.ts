import client from "~/server/db/client";
import { inngest } from "../inngest";
import logInngestError from "./error_handling";
import e from "@/dbschema/edgeql-js";
import { urlJoinP } from "url-join-ts";
import { env } from "~/env";
import { CF_API_HEADER } from "~/lib/server_utils";
import { z } from "zod";

const GetContactsResponse = z
  .object({
    result: z.literal("OK"),
    contacts: z.array(
      z.object({
        contact_id: z.number(),
      }),
    ),
  })
  .or(
    z.object({
      result: z.literal("ERROR"),
      error_message: z.string(),
    }),
  );

export const createContact = inngest.createFunction(
  {
    id: "createContact",
    name: "Create Contact",
    onFailure: logInngestError,
  },
  { event: "contact/create" },
  async ({ event, step, logger }) => {
    const contact = await step.run("get-contact", async () => {
      return await e
        .select(e.coreforce.Contact, (c) => ({
          filter_single: e.op(c.email, "=", event.data.contact.email),
        }))
        .run(client);
    });

    let contactId;
    if (contact) {
      contactId = contact.id;
    } else {
      const cfContactId = await step.run("get-contact-cfid", async () => {
        const apiResponse = await fetch(
          urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["api.php"], {
            method: "get_contacts",
            field_name: "email_address",
            search_text: event.data.contact.email,
          }),
          {
            method: "GET",
            cache: "no-cache",
            headers: CF_API_HEADER,
          },
        );

        const contacts = GetContactsResponse.parse(await apiResponse.json());

        if (contacts.result !== "OK") {
          throw new Error(
            "Error fetching contact ID: " + contacts.error_message,
          );
        }

        if (contacts.contacts.length === 0) {
          throw new Error(
            "No contact found for email: " + event.data.contact.email,
          );
        } else if (contacts.contacts.length > 1) {
          logger.warn(
            "Multiple contacts found for email: " + event.data.contact.email,
          );
        }

        return contacts.contacts[0]!.contact_id;
      });

      const newContact = await step.run("create-contact", async () => {
        return await e
          .insert(e.coreforce.Contact, {
            fullName: event.data.contact.fullName,
            email: event.data.contact.email,
            cfContactId: cfContactId,
          })
          .run(client);
      });

      contactId = newContact.id;
    }

    if (event.data.createTask) {
      await step.sendEvent("create-task", {
        name: "task/create",
        data: {
          contactId: contactId,
        },
      });
    }
  },
);

export const cancelContactTask = inngest.createFunction(
  {
    id: "cancelContactTask",
    name: "Cancel Contact Task",
    onFailure: logInngestError,
  },
  { event: "contact/cancel.task" },
  async ({ event, step }) => {
    const contact = await step.run("get-contact", async () => {
      return await e
        .select(e.coreforce.Contact, (c) => ({
          filter_single: e.op(c.email, "=", event.data.email),
          id: true,
          activeTask: {
            sequence: true,
          },
        }))
        .run(client);
    });

    // If the task doesn't exist, do nothing
    if (!contact?.activeTask) return;

    await step.sendEvent("delete-task", {
      name: "task/delete",
      data: {
        contactId: contact.id,
        sequence: contact.activeTask.sequence,
        reason: event.data.reason,
      },
    });
  },
);
