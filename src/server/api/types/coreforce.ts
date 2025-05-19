import { urlJoin } from "url-join-ts";
import { z } from "zod";
import { env } from "~/env";

export const OrderItem = z.object({
  product_id: z.number(),
  product_code: z.string(),
  description: z.string(),
  link_name: z
    .string()
    .transform((str) =>
      str.trim() === ""
        ? undefined
        : urlJoin(env.NEXT_PUBLIC_CF_HOST, "product", str),
    ),
  list_price: z.coerce.number(),
  sale_price: z.coerce.number(),
  upc_code: z.string().optional(),
});

export const CoreforceOrderDetails = z.object({
  order_id: z.number(),
  order_time: z.coerce.date(),
  contact_id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  address_1: z.string(),
  address_2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  email_address: z.string().email(),
  phone_number: z.string().optional(),
  order_status_code: z.string(),
});

export const CoreforceOrderItems = OrderItem.array();

export const CoreforceOrder = z
  .object({
    orders_row: CoreforceOrderDetails,
    order_items: CoreforceOrderItems,
    order_items_total: z.coerce.number(),
    order_total: z.coerce.number(),
  })
  .transform((obj) => ({
    details: obj.orders_row,
    items: obj.order_items,
    totals: {
      items: obj.order_items_total,
      order: obj.order_total,
    },
  }));

export const CoreforceContact = z.object({
  contact_id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  address_1: z.string(),
  address_2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  email_address: z.string().email(),
  user_id: z.number(),
  user_name: z.string(),
});
