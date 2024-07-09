import e from "@/dbschema/edgeql-js";
import { env } from "~/env";
import client from "../client";
import { type Cart } from "../types";

export async function getAbandonedCarts(requireEmail = true) {
  const data: Record<number, Cart[]> = {};
  for (let i = 1; i <= env.EMAIL_SEQUENCE_LENGTH; i++) {
    const minDays = (i - 1) * env.FREQUENCY;
    const maxDays = i * env.FREQUENCY;

    const query = e.select(e.coreforce.Contact, (contact) => {
      // We don't want to include items added on the current day so set
      // the time to midnight to only include items added yesterday and older
      const realNow = new Date();
      realNow.setHours(0, 0, 0, 0);
      const now = e.datetime(realNow);

      // Calculate the date range for the contact
      const newest = e.op(now, "-", e.to_duration({ hours: 24 * minDays }));
      const oldest = e.op(now, "-", e.to_duration({ hours: 24 * maxDays }));

      let filter = e.op(
        e.op(contact.items.timeSubmitted, "<=", newest),
        "and",
        e.op(contact.items.timeSubmitted, ">", oldest),
      );

      if (requireEmail) {
        filter = e.op(
          e.op("exists", contact.primaryEmailAddress),
          "and",
          filter,
        );
      }

      return {
        ...e.coreforce.Contact["*"],
        items: (item) => ({
          ...e.coreforce.CartItem["*"],
          order_by: {
            expression: item.timeSubmitted,
            direction: e.DESC
          },
          addons: (addon) => ({
            ...e.coreforce.ProductAddon["*"],
            order_by: {
              expression: addon.sortOrder,
              direction: e.ASC,
              empty: e.EMPTY_LAST,
            },
          }),
        }),
        filter: filter,
      };
    });
    data[i] = await query.run(client);
  }
  return data;
}

export async function getCartItems(contactId: string | number) {
  return await e
    .select(e.coreforce.CartItem, (item) => ({
      ...e.coreforce.CartItem["*"],
      addons: {
        ...e.coreforce.ProductAddon["*"],
      },
      filter: e.op(item.contact.contactId, "=", contactId),
    }))
    .run(client);
}
