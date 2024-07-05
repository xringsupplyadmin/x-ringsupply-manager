import e from "@/dbschema/edgeql-js";
import client from "../client";

export async function getContactsWithCarts(maxCartAge: number) {
  return await e
    .select(e.coreforce.Contact, (contact) => ({
      filter: e.op(
        e.op(
          contact.items.timeSubmitted,
          "+",
          e.to_duration({ hours: 24 * maxCartAge }),
        ),
        ">",
        e.datetime(new Date()),
      ),
    }))
    .run(client);
}

export async function getCartItems(contactId: string) {
  return await e.select(e.coreforce.CartItem, (item) => ({
    ...e.coreforce.CartItem["*"],
    filter: e.op(item.contact.contactId, "=", contactId)
  })).run(client)
}
