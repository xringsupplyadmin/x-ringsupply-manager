import { db } from "~/server/db";
import {
  type ApiResponse,
  getConflictInsertSet,
  newTiming,
  timing,
} from "../common";
import { getContacts } from "./cf_fetch";
import { contacts } from "~/server/db/schema/coreforce";

export async function syncContactsToDb(): Promise<
  ApiResponse<{ count: number }>
> {
  const tRef = newTiming();

  const data = await getContacts();

  console.debug("[syncContactsToDb] getContacts:", timing(tRef, true));

  if (!data.success) {
    return {
      success: false,
      error: data.error,
    };
  }

  if (data.contacts.length === 0) {
    return {
      success: true,
      count: 0,
    };
  }

  const conflictSet = getConflictInsertSet(contacts, data.contacts[0]!, {
    id: false,
    "*": true,
  });

  timing(tRef, false);

  await db.transaction(async (tx) => {
    for (let idx = 0; idx < data.contacts.length; idx += 500) {
      await tx
        .insert(contacts)
        .values(data.contacts.slice(idx, idx + 500))
        .onConflictDoUpdate({
          target: contacts.id,
          set: conflictSet,
        });
    }
  });

  console.debug("[syncContactsToDb] DB insert:", timing(tRef, true));

  return {
    success: true,
    count: data.contacts.length,
  };
}
