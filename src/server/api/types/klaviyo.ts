import { z } from "zod";

const MetricsProduct = z.object({
  productId: z.number(),
  sku: z.string().optional(),
  productName: z.string(),
  quantity: z.number(),
  itemPrice: z.number(),
  productUrl: z.string().url(),
  imageUrl: z.string().url(),
  categories: z.string().array(),
  brand: z.string(),
});

const MetricsAddress = z.object({
  firstName: z.string(),
  lastName: z.string(),
  address1: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  regionCode: z.string(),
  countryCode: z.string(),
  zip: z.string(),
  phone: z.string().optional(),
});

const MetricsUser = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
});

export const AbandonedCheckoutEvent = z.object({
  items: MetricsProduct.array(),
  currency: z.literal("USD").default("USD"),
  customer: MetricsUser,
});
export type AbandonedCheckoutEvent = z.infer<typeof AbandonedCheckoutEvent>;

export const AbandonedCheckoutApiEvent = AbandonedCheckoutEvent.transform(
  (event) => ({
    metadata: {
      metricID: MetricIDs.Enum["Abandoned Checkout"],
      profileEmail: event.customer.email,
      value: event.items.reduce((acc, item) => acc + item.itemPrice, 0),
      valueCurrency: event.currency,
    },
    data: {
      items: event.items.map((item) => ({
        product_id: item.productId,
        sku: item.sku,
        product_name: item.productName,
        quantity: item.quantity,
        item_price: item.itemPrice,
        row_total: item.itemPrice * item.quantity,
        product_url: item.productUrl,
        image_url: item.imageUrl,
        categories: item.categories,
        brand: item.brand,
      })),
    },
  }),
);

export const OrderPlacedEvent = z.object({
  orderId: z.coerce.number(),
  orderTime: z.coerce.date().optional(),
  discountCode: z.string().optional(),
  discountValue: z.number().default(0),
  items: MetricsProduct.array(),
  billingAddress: MetricsAddress,
  shippingAddress: MetricsAddress.optional(),
  currency: z.literal("USD").default("USD"),
  customer: MetricsUser,
});
export type OrderPlacedEvent = z.infer<typeof OrderPlacedEvent>;

export const OrderPlacedApiEvent = OrderPlacedEvent.transform((event) => ({
  metadata: {
    metricID: MetricIDs.Enum["Order Placed"],
    profileEmail: event.customer.email,
    value: event.items.reduce((acc, item) => acc + item.itemPrice, 0),
    valueCurrency: event.currency,
  },
  data: {
    // base order data
    order_id: event.orderId,
    discount_code: event.discountCode,
    discount_value: event.discountValue,
    // aggregates for items
    categories: event.items.flatMap((item) => item.categories),
    item_names: event.items.map((item) => item.productName),
    brands: event.items.map((item) => item.brand),
    // items
    items: event.items.map((item) => ({
      product_id: item.productId,
      sku: item.sku,
      product_name: item.productName,
      quantity: item.quantity,
      item_price: item.itemPrice,
      row_total: item.itemPrice * item.quantity,
      product_url: item.productUrl,
      image_url: item.imageUrl,
      categories: item.categories,
      brand: item.brand,
    })),
    // addresses
    billing_address: event.billingAddress,
    shipping_address: event.shippingAddress ?? event.billingAddress,
  },
}));

export const MetricIDs = z.enum(["Abandoned Checkout", "Order Placed"]);
export type MetricIDs = z.infer<typeof MetricIDs>;

/* The klaviyo API is very verbose. These function make it easier to work with up to the send point */

export type MetricData = {
  data: {
    type: "metric";
    attributes: {
      name: string;
    };
  };
};

export type ProfileData = {
  data: {
    type: "profile";
    attributes: {
      email: string;
    };
  };
};

export type EventMetadataBase = {
  uniqueId: string;
  time: Date;
  value?: number;
  valueCurrency?: string;
};

export type EventRawMetadata = EventMetadataBase & {
  metric: MetricData;
  profile: ProfileData;
};

export type EventBuilderMetadata = Partial<EventMetadataBase> & {
  metricID: MetricIDs;
  profileEmail: string;
};

export type EventData<Properties extends Record<string, unknown>> = {
  data: {
    type: "event";
    attributes: {
      properties: Properties;
    } & EventRawMetadata;
  };
};
