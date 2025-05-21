import { klaviyo, buildEvent } from "../../klaviyo";
import {
  type AbandonedCheckoutEvent,
  type OrderPlacedEvent,
  AbandonedCheckoutApiEvent,
  OrderPlacedApiEvent,
} from "../types/klaviyo";

export async function sendAbandonedCheckoutEvent(
  event: AbandonedCheckoutEvent,
) {
  try {
    const response = await klaviyo.events.createEvent(
      buildEvent(AbandonedCheckoutApiEvent.parse(event)),
    );

    return (await response).response.status;
  } catch {
    return null;
  }
}
export async function sendOrderPlacedEvent(event: OrderPlacedEvent) {
  // preprocess
  try {
    const response = klaviyo.events.createEvent(
      buildEvent(OrderPlacedApiEvent.parse(event)),
    );

    return (await response).response.status;
  } catch {
    return null;
  }
}
