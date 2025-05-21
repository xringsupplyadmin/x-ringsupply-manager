import { z } from "zod";
import { getContact } from "~/server/api/v2/coreforce/contacts_api";
import { getOrders } from "~/server/api/v2/coreforce/orders_api";
import { getProduct } from "~/server/api/v2/coreforce/products_api";
import { getShoppingCartItems } from "~/server/api/v2/coreforce/retailstore";
import {
  sendAbandonedCheckoutEvent,
  sendOrderPlacedEvent,
} from "~/server/api/v2/klaviyo/send_event";
import {
  productImageUrl,
  type CoreforceOrder,
} from "~/server/api/v2/types/coreforce";
import type { MetricsAddress } from "~/server/api/v2/types/klaviyo";

const DataParser = z.object({
  customer_email: z.string(),
  coreforce_id: z.coerce.number().optional(),
  since: z.coerce.date(),
  until: z.coerce.date().optional(),
  allow_large_ranges: z.boolean().default(false),
  strict_range: z.boolean().default(false),
});

export async function POST(request: Request) {
  const data = await request.json();

  const event = DataParser.safeParse(data);

  if (!event.success) {
    // TODO: log error to klaviyo
    return new Response(JSON.stringify(event.error), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  let orders;
  try {
    orders = await getOrders({
      since: event.data.since,
      until: event.data.until,
      allowLargeRanges: event.data.allow_large_ranges,
      strictRange: event.data.strict_range,
      email: event.data.customer_email,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : e;
    // TODO: log error to klaviyo
    return new Response(
      JSON.stringify({
        error: "Failed to fetch orders for " + event.data.customer_email,
        message: message,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  if (orders.length > 0) {
    // trigger order placed

    await orderTracking(orders);

    return new Response("Customer has placed order", {
      status: 200,
    });
  } else {
    // trigger abandoned checkout
    const contact = await getContact(
      "email_address",
      event.data.customer_email,
    );

    if (!contact) {
      return new Response("Contact not found", {
        status: 404,
      });
    }

    try {
      const items = await getShoppingCartItems(contact.contact_id);

      if (items.length === 0) {
        return new Response("Customer has no items in cart", {
          status: 200,
        });
      }

      sendAbandonedCheckoutEvent({
        items: items.map((item) => ({
          quantity: item.quantity,
          categories: [], // TODO: find the categories
          brand: "", // TODO: find the brand
          productId: item.product_id,
          productName: item.description,
          itemPrice: item.unit_price,
          productUrl: item.link_name,
          imageUrl: item.image_url,
        })),
        customer: {
          firstName: contact.first_name,
          lastName: contact.last_name,
          email: contact.email_address,
        },
        currency: "USD",
      });

      // return generic 200, the caller doesn't care
      return new Response("Event sent successfully", {
        status: 200,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : e;

      return new Response(
        JSON.stringify({
          error: "Failed to send event",
          message: message,
        }),
        {
          status: 500,
        },
      );
    }
  }
}

async function orderTracking(orders: CoreforceOrder[]) {
  for (const order of orders) {
    const billingAddress: MetricsAddress = {
      firstName: order.details.first_name,
      lastName: order.details.last_name,
      address1: order.details.address_1,
      address2: order.details.address_2,
      city: order.details.city,
      regionCode: order.details.postal_code,
      countryCode: "US",
      zip: order.details.postal_code,
    };

    const products = [];

    for (const item of order.items) {
      // janky shit cause the order doesn't include the image URL
      const productDetails = await getProduct(item.product_id);
      products.push({
        productId: item.product_id,
        sku: item.manufacturer_sku,
        productName: item.description,
        quantity: item.quantity,
        itemPrice: item.sale_price,
        productUrl: item.link_name,
        imageUrl: productImageUrl.parse(productDetails?.image_url),
        categories: [],
        brand: "",
      });
    }

    sendOrderPlacedEvent({
      orderId: order.details.order_id,
      orderTime: order.details.order_time,
      discountCode: undefined,
      discountValue: 0,
      items: products,
      billingAddress: billingAddress,
      shippingAddress: undefined,
      currency: "USD",
      customer: {
        firstName: order.details.first_name,
        lastName: order.details.last_name,
        email: order.details.email_address,
      },
    });
  }
}
