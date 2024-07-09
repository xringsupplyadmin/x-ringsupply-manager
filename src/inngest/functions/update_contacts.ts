import { syncContactsToDb } from "~/server/api/functions/sync_contacts";
import { inngest } from "../client";

export const updateContacts = inngest.createFunction(
  {
    id: "updateContacts",
  },
  { event: "db/update.contacts" },
  async () => {
    return await syncContactsToDb();
  },
);
