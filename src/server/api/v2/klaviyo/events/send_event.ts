import { klaviyo } from "../../../klaviyo";
import { getProduct } from "../../coreforce/products_api";
import { type CoreforceOrder, productImageUrl } from "../../types/coreforce";
import {
  AbandonedCheckoutApiEvent,
  type AbandonedCheckoutEvent,
  CreditOrderStartedApiEvent,
  type MetricsAddress,
  OrderCancelledApiEvent,
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

export async function sendCreditOrderStartedEvent(event: OrderPlacedEvent) {
  // preprocess
  try {
    const response = await klaviyo.events.createEvent(
      buildEvent(CreditOrderStartedApiEvent.parse(event)),
    );

    return response.response.status;
  } catch {
    return null;
  }
}

export async function sendOrderCancelledEvent(event: OrderPlacedEvent) {
  // preprocess
  try {
    const response = await klaviyo.events.createEvent(
      buildEvent(OrderCancelledApiEvent.parse(event)),
    );

    return response.response.status;
  } catch {
    return null;
  }
}

type OrderStatus = "placed" | "cancelled" | "credit_started";

export async function trackOrder(order: CoreforceOrder): Promise<OrderStatus> {
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
      categories: [], // TODO fetch category data
      brand: "", // TODO fetch manufacturer
    });
  }

  // Check if the order has pending credit payments
  let creditPending = false;
  for (const payment of order.payments) {
    if (payment.deleted) continue; // skip deleted payments
    if (
      (payment.payment_method_type_code === "CREDOVA" ||
        payment.payment_method_type_code === "SEZZLE") &&
      payment.not_captured
    ) {
      creditPending = true;
      break;
    }
  }

  const eventData = {
    orderId: order.details.order_id,
    orderTime: order.details.order_time,
    discountCode: undefined,
    discountValue: 0,
    items: products,
    billingAddress: billingAddress,
    shippingAddress: undefined,
    currency: "USD" as const,
    customer: {
      firstName: order.details.first_name,
      lastName: order.details.last_name,
      email: order.details.email_address,
    },
    creditPending: creditPending,
    externalPaymentUrl: order.details["custom_field-external_payment_url"],
  };

  // Check for cancelled orders
  if (order.details.deleted) {
    await sendOrderCancelledEvent(eventData);
    return "cancelled";
  } else if (creditPending) {
    // uncaptured payment on credit order, do not track as a real order
    await sendCreditOrderStartedEvent(eventData);
    return "credit_started";
  } else {
    // June 6: I can't believe I forgot to await this...
    await sendOrderPlacedEvent(eventData);
    return "placed";
  }
}

export async function orderTracking(orders: CoreforceOrder[]) {
  const tracked = {
    creditStarted: 0,
    orderPlaced: 0,
    orderCancelled: 0,
  };
  for (const order of orders) {
    switch (await trackOrder(order)) {
      case "placed":
        tracked.orderPlaced++;
        break;
      case "cancelled":
        tracked.orderCancelled++;
        break;
      case "credit_started":
        tracked.creditStarted++;
        break;
      default:
        throw new Error("Unknown order status");
    }
  }
  return tracked;
}
