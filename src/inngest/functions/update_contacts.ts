import { fetchApiContacts } from "~/server/api/functions/fetch_contacts";
import { syncContactsToDb } from "~/server/api/functions/sync_contacts";
import { inngest } from "../client";
import logInngestError from "./error_handling";

export const updateContacts = inngest.createFunction(
  {
    id: "updateContacts",
    name: "Update Contacts",
    onFailure: logInngestError,
  },
  { event: "db/update.contacts" },
  async ({ step }) => {
    const contacts = await step.run("fetch-api-contacts", async () => {
      const apiData = await fetchApiContacts();

      if (!apiData.success) {
        throw new Error("Error fetching API contacts: " + apiData.error);
      }

      return apiData.contacts;
    });

    const synced = await step.run("sync-contacts-to-db", async () => {
      const dbResponse = await syncContactsToDb(contacts);

      if (!dbResponse.success) {
        throw new Error("Error syncing contacts to DB: " + dbResponse.error);
      }

      return dbResponse.count;
    });

    return {
      countFromApi: contacts.length,
      countSynced: synced,
    };
  },
);
