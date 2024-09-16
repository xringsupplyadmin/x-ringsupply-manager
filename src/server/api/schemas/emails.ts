import { type LiteralZodEventSchema } from "inngest";
import { z } from "zod";

const createContact = z.object({
  name: z.literal("contact/create"),
  data: z.object({
    contact: z.object({
      fullName: z.string(),
      email: z.string(),
    }),
    createTask: z.boolean(),
  }),
}) satisfies LiteralZodEventSchema;

const cancelContactTask = z.object({
  name: z.literal("contact/cancel.task"),
  data: z.object({
    email: z.string(),
    reason: z.string(),
  }),
}) satisfies LiteralZodEventSchema;

const updateContactCart = z.object({
  name: z.literal("contact/update.cart"),
  data: z.object({
    contactId: z.string(),
  }),
}) satisfies LiteralZodEventSchema;

const createTask = z.object({
  name: z.literal("task/create"),
  data: z.object({
    contactId: z.string(),
  }),
}) satisfies LiteralZodEventSchema;

const deleteTask = z.object({
  name: z.literal("task/delete"),
  data: z.object({
    contactId: z.string(),
    sequence: z.number(),
    reason: z.string(),
  }),
});

const executeTask = z.object({
  name: z.literal("task/execute"),
  data: z.object({
    taskId: z.string(),
  }),
}) satisfies LiteralZodEventSchema;

const schema = [
  createContact,
  cancelContactTask,
  updateContactCart,
  createTask,
  deleteTask,
  executeTask,
];
export default schema;
