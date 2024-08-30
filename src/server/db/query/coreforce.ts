import e, { type Cardinality } from "@/dbschema/edgeql-js";
import { type $expr_Operator } from "@/dbschema/edgeql-js/funcops";
import { type $bool } from "@/dbschema/edgeql-js/modules/std";
import client from "../client";

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
      steps: (s) => ({
        ...e.coreforce.EmailTaskStep["*"],
        order_by: {
          expression: s.time,
          direction: e.DESC,
        },
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
      }),
      activeTask: () => ({
        ...e.coreforce.EmailTask["*"],
      }),
      steps: (s) => ({
        ...e.coreforce.EmailTaskStep["*"],
        order_by: {
          expression: s.time,
          direction: e.DESC,
        },
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
    }),
    activeTask: () => ({
      ...e.coreforce.EmailTask["*"],
    }),
    steps: (s) => ({
      ...e.coreforce.EmailTaskStep["*"],
      order_by: {
        expression: s.time,
        direction: e.DESC,
      },
    }),
  }));

  return await query.run(client);
}

export async function unsubscribeContact(email: string) {
  const query = e.update(e.coreforce.Contact, (c) => ({
    filter_single: e.op(c.email, "=", email),
    set: {
      unsubscribed: true,
    },
  }));

  return await query.run(client);
}
