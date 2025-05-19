import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { AbandonedCheckoutEvent, OrderPlacedEvent } from "../../types/klaviyo";
import {
  sendAbandonedCheckoutEvent,
  sendOrderPlacedEvent,
} from "../../v2/klaviyo/send_event";

export const klaviyoRouter = createTRPCRouter({
  sendEvent: {
    abandonedCheckout: protectedProcedure
      .input(AbandonedCheckoutEvent)
      .mutation(async ({ input: event }) => {
        return await sendAbandonedCheckoutEvent(event);
      }),
    orderPlaced: protectedProcedure
      .input(OrderPlacedEvent)
      .mutation(async ({ input: event }) => {
        return sendOrderPlacedEvent(event);
      }),
  },
});
