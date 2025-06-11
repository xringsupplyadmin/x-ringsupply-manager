import { urlJoin, urlJoinP } from "url-join-ts";
import { z, type ZodTypeAny } from "zod";
import { env } from "~/env";

const linkTransform = (str: string) =>
  str.trim() === ""
    ? undefined
    : urlJoin(env.NEXT_PUBLIC_CF_HOST, "product", str);

type ProductLike = { product_id: number; link_name?: string };
const forceLinkName = <Product extends ProductLike>(product: Product) => {
  return {
    ...product,
    link_name:
      product.link_name ??
      urlJoinP(env.NEXT_PUBLIC_CF_HOST, ["product-details"], {
        id: product.product_id,
      }),
  };
};

const apiOptional = <Type extends ZodTypeAny>(t: Type) =>
  z.preprocess((obj) => {
    // Api returns optional types as empty strings (FP)
    if (typeof obj === "string" && obj.trim() === "") {
      return undefined;
    }

    return t.parse(obj);
  }, t.optional());

const optNumber = apiOptional(z.coerce.number());
const optString = apiOptional(z.string());

export const safeUrl = (fallback: string) =>
  z.preprocess((str) => {
    if (
      str === undefined ||
      str === null ||
      (typeof str === "string" && str.trim() === "")
    ) {
      return fallback;
    }

    const res = z.string().url().safeParse(str);
    if (res.success) {
      return res.data;
    } else {
      return fallback;
    }
  }, z.string().url());

export const productImageUrl = safeUrl(
  "https://placehold.co/600/jpg?text=Image+Not+Found",
);

export const coreforceDate = z
  .string()
  .transform((str) => new Date(str + " EST"));

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

export const OrderItem = z
  .object({
    product_id: z.number(),
    product_code: z.string(),
    description: z.string(),
    link_name: z.string().transform(linkTransform),
    list_price: z.coerce.number(),
    sale_price: z.coerce.number(),
    quantity: z.number(),
    upc_code: optString,
    manufacturer_sku: optString,
  })
  .transform(forceLinkName);
export type OrderItem = z.infer<typeof OrderItem>;

export const CoreforceOrderDetails = z.object({
  order_id: z.number(),
  // order_time: z.coerce.date(),
  // some terrible date parsing because CF doesn't return the timezone (hopefully its in EST lmao)
  order_time: coreforceDate,
  contact_id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  address_1: z.string(),
  address_2: optString,
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  email_address: z.string().email(),
  phone_number: optString,
  order_status_code: z.string(),
  deleted: z.coerce.boolean(),
  "custom_field-external_payment_url": z.string().url().optional(),
});

export const CoreforceOrderPayment = z
  .object({
    order_payment_id: z.number(),
    payment_time: coreforceDate,
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

export const CoreforceContact = z.object({
  contact_id: z.number(),
  first_name: z.string(),
  last_name: z.string(),
  address_1: z.string(),
  address_2: optString,
  city: z.string(),
  state: z.string(),
  postal_code: z.string(),
  email_address: z.string().email(),
  user_id: z.number(),
  user_name: z.string(),
});
export type CoreforceContact = z.infer<typeof CoreforceContact>;

export const CoreforceProductTaxonomy = z
  .object({
    product_categories: z.array(
      z.object({
        product_id: z.number(),
        product_code: z.string(),
        product_categories: z.record(z.string()),
      }),
    ),
  })
  .transform((o) => o.product_categories);
export type CoreforceProductTaxonomy = z.infer<typeof CoreforceProductTaxonomy>;

export const CoreforceProduct = z
  .object({
    product_id: z.number(),
    product_code: z.string(),
    description: z.string(),
    detailed_description: z.string(),
    link_name: z.string().transform(linkTransform),
    product_manufacturer_id: optNumber,
    base_cost: z.coerce.number(),
    list_price: z.coerce.number(),
    image_id: optNumber,
    upc_code: optString,
    manufacturer_sku: optString,
    image_url: z.string().url(),
    small_image_url: z.string().url(),
    thumbnail_image_url: z.string().url(),
    alternate_image_urls: z.array(
      z
        .object({
          url: z.string().url(),
        })
        .transform((obj) => obj.url),
    ),
  })
  .transform(forceLinkName);
export type CoreforceProduct = z.infer<typeof CoreforceProduct>;

/** Retailstore */
const formattedNumber = z.preprocess(
  (num) =>
    typeof num === "string"
      ? Number(num.replaceAll(",", ""))
      : z.coerce.number().parse(num),
  z.number(),
);

/**
 * The response from the CF "API" for the cart items
 *
 * Why is this not a normal API method?
 * Because CF is a piece of sh*t (pardon the french)
 */
export const RetailStoreCart = z.object({
  shopping_cart_items: z
    .object({
      shopping_cart_item_id: z.number(),
      shopping_cart_id: z.number(),
      product_id: z.number(),
      description: z.string(),
      time_submitted: z.date({
        coerce: true,
      }),
      quantity: z.number(),
      unit_price: formattedNumber,
      list_price: formattedNumber,
      small_image_url: productImageUrl,
      image_url: productImageUrl,
    })
    .transform(forceLinkName)
    .array(),
});
export type RetailStoreCart = z.infer<typeof RetailStoreCart>;
