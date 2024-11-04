import { type LiteralZodEventSchema } from "inngest";
import { z } from "zod";

const authorizeApi = z.object({
  name: z.literal("api/authorize"),
}) satisfies LiteralZodEventSchema;

const fetchApiCart = z.object({
  name: z.literal("api/fetch.cart"),
  data: z.object({
    cfContactId: z.number(),
  }),
}) satisfies LiteralZodEventSchema;

const schema = [authorizeApi, fetchApiCart];
export default schema;
