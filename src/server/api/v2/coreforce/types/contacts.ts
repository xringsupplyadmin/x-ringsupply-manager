import { z } from "zod/v4";
import { optString } from "./cf-api";

export const CoreforceContact = z.object({
  contact_id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  address_1: z.string(),
  address_2: optString,
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  email_address: z.email(),
  user_id: z.number(),
  user_name: z.string(),
});
export type CoreforceContact = z.infer<typeof CoreforceContact>;
