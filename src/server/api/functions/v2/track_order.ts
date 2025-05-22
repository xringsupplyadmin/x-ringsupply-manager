import { inngest } from "../../inngest";
import { getOrders } from "../../v2/coreforce/orders_api";
import { orderTracking } from "../../v2/klaviyo/send_event";
import logInngestError from "../emails/error_handling";

export const klaviyoOrderTracking = inngest.createFunction(
  {
    id: "klaviyo-order-tracking",
    name: "Scheduled Runner for Order Tracking in Klaviyo",
    onFailure: logInngestError,
  },
  { cron: "TZ=America/New_York 0,30 * * * *" },
  async () => {
    const date = new Date();
    date.setUTCHours(date.getUTCHours() - 1);

    const orders = await getOrders({
      since: date,
    });

    await orderTracking(orders);
  },
);
