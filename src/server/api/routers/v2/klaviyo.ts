import { buildEvent, klaviyo } from "../../klaviyo";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import {
  AbandonedCheckoutApiEvent,
  AbandonedCheckoutEvent,
  OrderPlacedApiEvent,
  OrderPlacedEvent,
} from "../../types/klaviyo";

export const klaviyoRouter = createTRPCRouter({
  sendEvent: {
    abandonedCheckout: protectedProcedure
      .input(AbandonedCheckoutEvent)
      .mutation(async ({ input: event }) => {
        try {
          const response = await klaviyo.events.createEvent(
            buildEvent(AbandonedCheckoutApiEvent.parse(event)),
          );

          return (await response).response.status;
        } catch {
          return null;
        }
      }),
    orderPlaced: protectedProcedure
      .input(OrderPlacedEvent)
      .mutation(async ({ input: event }) => {
        // preprocess
        try {
          const response = klaviyo.events.createEvent(
            buildEvent(OrderPlacedApiEvent.parse(event)),
          );

          return (await response).response.status;
        } catch {
          return null;
        }
      }),
  },
});
