import { klaviyo } from "../../../klaviyo";
import { getProduct } from "../../coreforce/products_api";
import { type CoreforceOrder, productImageUrl } from "../../types/coreforce";
import {
  AbandonedCheckoutApiEvent,
  type AbandonedCheckoutEvent,
  type MetricsAddress,
  OrderPlacedApiEvent,
  type OrderPlacedEvent,
} from "../../types/klaviyo";
import { buildEvent } from "~/server/api/v2/klaviyo/events/event_builder";

export async function sendAbandonedCheckoutEvent(
  event: AbandonedCheckoutEvent,
) {
  try {
    const response = await klaviyo.events.createEvent(
      buildEvent(AbandonedCheckoutApiEvent.parse(event)),
    );

    return response.response.status;
  } catch {
    return null;
  }
}

export async function sendOrderPlacedEvent(event: OrderPlacedEvent) {
  // preprocess
  try {
    const response = await klaviyo.events.createEvent(
      buildEvent(OrderPlacedApiEvent.parse(event)),
    );

    return response.response.status;
  } catch {
    return null;
  }
}

export async function orderTracking(orders: CoreforceOrder[]) {
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

    // June 6: I can't believe I forgot to await this...
    await sendOrderPlacedEvent({
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
