import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { AbandonedCheckoutEvent, OrderPlacedEvent } from "../../types/klaviyo";
import {
  sendAbandonedCheckoutEvent,
  sendOrderPlacedEvent,
} from "../../klaviyo/events/send_event";

export const klaviyoEventsRouter = createTRPCRouter({
  send: {
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
