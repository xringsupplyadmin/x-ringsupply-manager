import e from "@/dbschema/edgeql-js";
import { batchTransaction } from "~/server/db/client";
import { type ApiResponse } from "../common";
import { type Contact } from "~/server/db/types";

export async function syncContactsToDb(
  contacts: Contact[],
): Promise<ApiResponse<{ count: number }>> {
  if (contacts.length === 0) {
    return {
      success: true,
      count: 0,
    };
  }

  await batchTransaction(contacts, async (tx, contacts) =>
    e
      .params(
        {
          json: e.json,
        },
        ({ json }) =>
          e.for(e.json_array_unpack(json), (contact) => {
            const constructed = {
              contactId: e.cast(e.int64, e.json_get(contact, "contactId")),
              firstName: e.cast(e.str, e.json_get(contact, "firstName")),
              lastName: e.cast(e.str, e.json_get(contact, "lastName")),
              businessName: e.cast(e.str, e.json_get(contact, "businessName")),
              company: e.cast(e.str, e.json_get(contact, "company")),
              salutation: e.cast(e.str, e.json_get(contact, "salutation")),
              address1: e.cast(e.str, e.json_get(contact, "address1")),
              address2: e.cast(e.str, e.json_get(contact, "address2")),
              city: e.cast(e.str, e.json_get(contact, "city")),
              state: e.cast(e.str, e.json_get(contact, "state")),
              postalCode: e.cast(e.str, e.json_get(contact, "postalCode")),
              country: e.cast(e.str, e.json_get(contact, "country")),
              primaryEmailAddress: e.cast(
                e.str,
                e.json_get(contact, "primaryEmailAddress"),
              ),
              notes: e.cast(e.str, e.json_get(contact, "notes")),
              alternateEmail: e.cast(
                e.str,
                e.json_get(contact, "alternateEmail"),
              ),
              phoneNumbers: e.cast(e.str, e.json_get(contact, "phoneNumbers")),
              phone: e.cast(e.str, e.json_get(contact, "phone")),
            };
            return e
              .insert(e.coreforce.Contact, constructed)
              .unlessConflict((c) => ({
                on: c.contactId,
                else: e.update(e.coreforce.Contact, (updated) => ({
                  set: constructed,
                  filter: e.op(updated.contactId, "=", c.contactId),
                })),
              }));
          }),
      )
      .run(tx, { json: contacts }),
  );

  return {
    success: true,
    count: contacts.length,
  };
}
