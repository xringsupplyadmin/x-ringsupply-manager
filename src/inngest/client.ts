import { EventSchemas, Inngest, type LiteralZodEventSchema } from "inngest";
import { z } from "zod";

const authorizeApi = z.object({
  name: z.literal("api/authorize"),
  data: z.object({}),
}) satisfies LiteralZodEventSchema;

const updateUserCartItems = z.object({
  name: z.literal("db/update.user.cart_items"),
  data: z.object({
    contacts: z.array(
      z.object({
        id: z.string(),
        contactId: z.number(),
      }),
    ),
  }),
}) satisfies LiteralZodEventSchema;

const updateCartItems = z.object({
  name: z.literal("db/update.cart_items"),
  data: z.object({}),
}) satisfies LiteralZodEventSchema;

const updateContacts = z.object({
  name: z.literal("db/update.contacts"),
  data: z.object({}),
}) satisfies LiteralZodEventSchema;

const updateEmailTasks = z.object({
  name: z.literal("system/update.email.tasks"),
  data: z.object({}),
}) satisfies LiteralZodEventSchema;

const processEmailTasks = z.object({
  name: z.literal("system/process.email.tasks"),
  data: z.object({}),
}) satisfies LiteralZodEventSchema;

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "x-ring-supply",
  schemas: new EventSchemas().fromZod([
    authorizeApi,
    updateUserCartItems,
    updateCartItems,
    updateContacts,
    updateEmailTasks,
    processEmailTasks,
  ]),
});
