import e from "@/dbschema/edgeql-js";
import { env } from "~/env";
import client from "../client";

export async function getAbandonedCarts(requireEmail = true) {
  const query = e.select(e.coreforce.Contact, (contact) => {
    const now = e.datetime(new Date());

    // Calculate the date range for the contact
    const newest = e.op(
      now,
      "-",
      e.to_duration({ hours: env.MIN_AGE_THRESHOLD }),
    );
    const oldest = e.op(
      now,
      "-",
      e.to_duration({ hours: 24 * env.MAX_AGE_THRESHOLD }),
    );

    let filter = e.op(
      e.op(contact.items.timeSubmitted, "<=", newest), // Must have items older than the cutoff
      "and",
      e.op(
        e.op(contact.items.timeSubmitted, ">", oldest), // Items must be newer than the cutoff
        "or",
        e.op(
          "exists",
          e.select(e.coreforce.EmailTask, (t) => ({
            filter_single: e.op(t.contact.id, "=", contact.id),
          })),
        ), // Or the contact must have an existing email task
      ),
    );

    if (requireEmail) {
      filter = e.op(e.op("exists", contact.primaryEmailAddress), "and", filter);
    }

    return {
      ...e.coreforce.Contact["*"],
      items: (item) => ({
        ...e.coreforce.CartItem["*"],
        order_by: {
          expression: item.timeSubmitted,
          direction: e.DESC,
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
  return await query.run(client);
}

export async function getEmailTasks() {
  const query = e.select(e.coreforce.EmailTask, () => ({
    ...e.coreforce.EmailTask["*"],
    contact: {
      ...e.coreforce.Contact["*"],
      items: (item) => ({
        ...e.coreforce.CartItem["*"],
        order_by: {
          expression: item.timeSubmitted,
          direction: e.DESC,
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
    },
  }));

  return await query.run(client);
}
