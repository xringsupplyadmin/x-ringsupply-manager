import e, { type Cardinality } from "@/dbschema/edgeql-js";
import { type $expr_Operator } from "@/dbschema/edgeql-js/funcops";
import { type $bool } from "@/dbschema/edgeql-js/modules/std";
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
  const query = e.select(e.coreforce.EmailTask, (task) => ({
    ...e.coreforce.EmailTask["*"],
    order_by: {
      expression: task.origination,
      direction: e.DESC,
    },
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

export async function getContactsWithTasks() {
  const query = e.select(e.coreforce.Contact, (c) => ({
    ...e.coreforce.Contact["*"],
    activeTask: () => ({
      ...e.coreforce.EmailTask["*"],
    }),
    filter: e.op("exists", c.activeTask),
  }));

  return await query.run(client);
}

export async function getContactsWithSteps(success?: boolean) {
  const query = e.select(e.coreforce.Contact, (c) => {
    let filter: $expr_Operator<$bool, Cardinality> = e.op("exists", c.steps);
    if (success !== undefined) {
      filter = e.op(filter, "and", e.op(c.steps.success, "=", success));
    }
    return {
      ...e.coreforce.Contact["*"],
      steps: () => ({
        ...e.coreforce.EmailTaskStep["*"],
      }),
      filter,
    };
  });

  return await query.run(client);
}

export async function getContacts(params: {
  hasItems?: boolean;
  limit?: number;
  offset?: number;
}) {
  const query = e.select(e.coreforce.Contact, (contact) => {
    return {
      ...e.coreforce.Contact["*"],
      filter:
        params.hasItems !== undefined
          ? params.hasItems
            ? e.op("exists", contact.items)
            : e.op("not", e.op("exists", contact.items))
          : undefined,
      order_by: {
        expression: e.op("exists", contact.items),
        direction: e.DESC,
      },
      limit: params.limit,
      offset: params.offset,
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
      activeTask: () => ({
        ...e.coreforce.EmailTask["*"],
      }),
      steps: () => ({
        ...e.coreforce.EmailTaskStep["*"],
      }),
    };
  });
  return await query.run(client);
}

export async function getContact(contactId: string) {
  const query = e.select(e.coreforce.Contact, (c) => ({
    ...e.coreforce.Contact["*"],
    filter_single: e.op(c.id, "=", e.uuid(contactId)),
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
    activeTask: () => ({
      ...e.coreforce.EmailTask["*"],
    }),
    steps: () => ({
      ...e.coreforce.EmailTaskStep["*"],
    }),
  }));

  return await query.run(client);
}
