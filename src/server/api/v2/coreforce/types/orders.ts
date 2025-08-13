import { z } from "zod/v4";
import { dateEST, optString } from "./cf-api";
import { defaultAbsoluteLinkName } from "./products";

export const OrderStatusCode = z.enum([
  "PAYMENTS_NOT_COMPLETE",
  "EXTERNAL_PAYMENTS_NOT_COMPLETE",
  "ORDER_CANCELED",
]);
export type OrderStatusCode = z.infer<typeof OrderStatusCode>;

export const PaymentMethodType = z.enum([
  "CREDIT_CARD",
  "GIFT_CARD",
  "LOYALTY_POINTS",
  "SEZZLE",
  "CREDOVA",
]);
export type PaymentMethodType = z.infer<typeof PaymentMethodType>;

export const OrderItem = z
  .object({
    product_id: z.number(),
    product_code: z.string(),
    description: z.string(),
    link_name: optString,
    list_price: z.coerce.number(),
    sale_price: z.coerce.number(),
    quantity: z.number(),
    upc_code: optString,
    manufacturer_sku: optString,
  })
  .transform(defaultAbsoluteLinkName);
export type OrderItem = z.infer<typeof OrderItem>;

export const CoreforceOrderDetails = z.object({
  order_id: z.number(),
  // order_time: z.coerce.date(),
  // some terrible date parsing because CF doesn't return the timezone (hopefully its in EST lmao)
  order_time: dateEST,
  contact_id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  address_1: z.string(),
  address_2: optString,
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  email_address: z.email(),
  phone_number: optString,
  order_status_code: z.string(),
  deleted: z.coerce.boolean(),
  "custom_field-external_payment_url": z.url().optional(),
});
export type CoreforceOrderDetails = z.infer<typeof CoreforceOrderDetails>;

export const CoreforceOrderPayment = z
  .object({
    order_payment_id: z.number(),
    payment_time: dateEST,
    amount: z.coerce.number(),
    shipping_charge: z.coerce.number(),
    transaction_identifier: z.string(),
    not_captured: z.coerce.boolean(),
    deleted: z.coerce.boolean(),
    payment_method_type_code: PaymentMethodType,
  })
  .transform((p) => ({
    ...p,
    payment_total: p.amount + p.shipping_charge,
  }));
export type CoreforceOrderPayment = z.infer<typeof CoreforceOrderPayment>;

export const CoreforceOrder = z
  .object({
    orders_row: CoreforceOrderDetails,
    order_items: OrderItem.array(),
    order_items_total: z.coerce.number(),
    order_total: z.coerce.number(),
    order_payments: CoreforceOrderPayment.array(),
  })
  .transform((obj) => ({
    details: obj.orders_row,
    items: obj.order_items,
    totals: {
      items: obj.order_items_total,
      order: obj.order_total,
    },
    payments: obj.order_payments,
  }));
export type CoreforceOrder = z.infer<typeof CoreforceOrder>;
