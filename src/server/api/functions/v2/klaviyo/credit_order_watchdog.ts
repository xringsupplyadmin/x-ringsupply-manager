import { inngest } from "../../../inngest";
import { getOrders } from "../../../v2/coreforce/cf-orders-api";
import { orderTracking } from "../../../v2/klaviyo/events/send_event";
import logInngestError from "../../error_handling";

export const klaviyoCreditOrderWatchdog = inngest.createFunction(
  {
    id: "klaviyo-credit-order-watchdog",
    name: "Scheduled Runner for Credit Order Tracking in Klaviyo",
    onFailure: logInngestError,
  },
  { cron: "TZ=America/New_York 0,20,40 * * * *" },
  async () => {
    const date = new Date();
    date.setUTCHours(date.getUTCHours() - 1);

    const orders = await getOrders({
      since: date,
    });

    await orderTracking(orders);
  },
);

const functions = [klaviyoCreditOrderWatchdog];
export default functions;
